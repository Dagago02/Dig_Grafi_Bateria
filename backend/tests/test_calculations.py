import pytest
from app.calculations.intralaboral import calculate_intralaboral
from app.calculations.extralaboral import calculate_extralaboral
from app.calculations.estres import calculate_estres

def test_intralaboral_forma_a():
    # Mock answers for Forma A (1..123)
    answers_a = {i: "Nunca" for i in range(1, 124)}
    res = calculate_intralaboral(answers_a, "A")
    
    assert "dimensiones" in res
    assert "dominios" in res
    assert "total" in res
    assert 0.0 <= res["total"]["puntaje_transformado"] <= 100.0
    assert res["total"]["nivel_riesgo"] in [
        "Sin riesgo o riesgo despreciable", "Riesgo bajo", "Riesgo medio", "Riesgo alto", "Riesgo muy alto"
    ]

def test_intralaboral_forma_b():
    # Mock answers for Forma B (1..97)
    answers_b = {i: "Siempre" for i in range(1, 98)}
    res = calculate_intralaboral(answers_b, "B")

    assert "dimensiones" in res
    assert "dominios" in res
    assert "total" in res
    assert 0.0 <= res["total"]["puntaje_transformado"] <= 100.0

def test_extralaboral_scoring():
    # Mock answers for Extralaboral (1..31)
    answers_extra = {i: "Algunas veces" for i in range(1, 32)}
    res1 = calculate_extralaboral(answers_extra, grupo_ocupacional=1)
    res2 = calculate_extralaboral(answers_extra, grupo_ocupacional=2)

    assert "dimensiones" in res1
    assert 0.0 <= res1["total"]["puntaje_transformado"] <= 100.0
    assert 0.0 <= res2["total"]["puntaje_transformado"] <= 100.0

def test_likert_label_aliases_match_numeric_frequency():
    from app.calculations.intralaboral import score_item

    assert score_item("A", 1, "Siempre") == score_item("A", 1, "4")
    assert score_item("A", 1, "Casi siempre") == score_item("A", 1, "3")
    assert score_item("A", 1, "Casi siempre") == score_item("A", 1, "3")
    assert score_item("A", 1, "A veces") == score_item("A", 1, "2")
    assert score_item("A", 4, "Siempre") == 0
    assert score_item("A", 4, "4") == 0
    assert score_item("A", 1, "Siempre") == 4


def test_estres_scoring():
    # Mock answers for Estrés (1..31)
    answers_estres = {i: "A veces" for i in range(1, 32)}
    res = calculate_estres(answers_estres, grupo_ocupacional=1)

    assert "total" in res
    assert 0.0 <= res["total"]["puntaje_transformado"] <= 100.0
    assert res["total"]["nivel_riesgo"] in ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"]
