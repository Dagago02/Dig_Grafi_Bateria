import unicodedata


def _fold(text: str) -> str:
    normalized = unicodedata.normalize("NFD", str(text).strip().lower())
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


# Frecuencia cruda (Siempre=máximo), ANTES de aplicar directo/inverso.
_FREQ_0_4 = {
    "siempre": 4,
    "casi siempre": 3,
    "algunas veces": 2,
    "a veces": 2,
    "casi nunca": 1,
    "nunca": 0,
    "4": 4,
    "3": 3,
    "2": 2,
    "1": 1,
    "0": 0,
}

# Cuestionario de estrés: Siempre=3 … Nunca=0
_FREQ_0_3 = {
    "siempre": 3,
    "casi siempre": 2,
    "algunas veces": 1,
    "a veces": 1,
    "casi nunca": 1,
    "nunca": 0,
    "3": 3,
    "2": 2,
    "1": 1,
    "0": 0,
}


def likert_frequency_0_4(val_str: str) -> int:
    return _FREQ_0_4.get(_fold(val_str), 0)


def likert_frequency_0_3(val_str: str) -> int:
    return _FREQ_0_3.get(_fold(val_str), 0)
