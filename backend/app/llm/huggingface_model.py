import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from langchain_core.language_models.llms import LLM

from app.core.config import settings


def get_device() -> torch.device:
    """
    Select the best available device.

    Apple Silicon:
        MPS

    NVIDIA GPU:
        CUDA

    Otherwise:
        CPU
    """

    if torch.backends.mps.is_available():
        return torch.device("mps")

    if torch.cuda.is_available():
        return torch.device("cuda")

    return torch.device("cpu")


class HuggingFaceQwenLLM(LLM):

    model: object
    tokenizer: object
    device: str

    @property
    def _llm_type(self) -> str:
        return "huggingface-qwen"

    @property
    def _identifying_params(self) -> dict:
        return {
            "model": settings.hf_llm_model,
            "device": self.device,
        }

    def _call(
        self,
        prompt: str,
        stop: list[str] | None = None,
        run_manager=None,
        **kwargs,
    ) -> str:

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a precise research interview analysis assistant. "
                    "Follow the user's instructions exactly. "
                    "Return only the requested JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ]

        formatted_prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self.tokenizer(
            formatted_prompt,
            return_tensors="pt",
        )

        inputs = {
            key: value.to(self.model.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            output = self.model.generate(
                **inputs,
                max_new_tokens=4096,
                do_sample=False,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated_tokens = output[
            0
        ][
            inputs["input_ids"].shape[1]:
        ]

        response = self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True,
        )

        return response.strip()


def get_huggingface_llm():

    device = get_device()

    print(f"\nLoading Hugging Face model on: {device}")

    tokenizer = AutoTokenizer.from_pretrained(
        settings.hf_llm_model,
    )

    model = AutoModelForCausalLM.from_pretrained(
        settings.hf_llm_model,
        dtype=torch.float16 if device.type == "mps" else torch.float32,
    )

    model = model.to(device)

    model.eval()

    return HuggingFaceQwenLLM(
        model=model,
        tokenizer=tokenizer,
        device=str(device),
    )