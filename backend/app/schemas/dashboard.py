from pydantic import BaseModel
from typing import List, Optional

class ChartData(BaseModel):
    name: str
    value: int
    percentage: Optional[float] = None

class DashboardDemographics(BaseModel):
    totalEmployees: int
    sexo: List[ChartData]
    estadoCivil: List[ChartData]
    escolaridad: List[ChartData]
    estrato: List[ChartData]
    tipoVivienda: List[ChartData]
    personasACargo: List[ChartData]
    antiguedadEmpresa: List[ChartData]
    tipoCargo: List[ChartData]
    antiguedadCargo: List[ChartData]
    tipoContrato: List[ChartData]
    tipoSalario: List[ChartData]
    rangosEdad: List[ChartData]

class RiskLevelData(BaseModel):
    name: str
    muyAlto: int
    alto: int
    medio: int
    bajo: int
    sinRiesgo: int
    total: int

class ExtralaboralStats(BaseModel):
    tiempoFueraTrabajo: RiskLevelData
    relacionesFamiliares: RiskLevelData
    comunicacionRelaciones: RiskLevelData
    situacionEconomica: RiskLevelData
    caracteristicasVivienda: RiskLevelData
    influenciaEntorno: RiskLevelData
    desplazamientoVivienda: RiskLevelData
    consolidadoExtralaboral: RiskLevelData
    total: int

class StressStats(BaseModel):
    fisiologico: RiskLevelData
    psicologico: RiskLevelData
    social: RiskLevelData
    psicoemocional: RiskLevelData
    consolidadoEstres: RiskLevelData
    total: int

# Note: For IntralaboralStats we can simplify by grouping dimensions by their keys.
# We will use a dictionary-based structure for flexibility in Python, mapped to RiskLevelData
class IntralaboralStats(BaseModel):
    # A generic dictionary map for any dimension/domain key -> RiskLevelData
    dimensiones_A: dict[str, RiskLevelData] = {}
    dominios_A: dict[str, RiskLevelData] = {}
    consolidado_A: Optional[RiskLevelData] = None

    dimensiones_B: dict[str, RiskLevelData] = {}
    dominios_B: dict[str, RiskLevelData] = {}
    consolidado_B: Optional[RiskLevelData] = None

    totalFormaA: int = 0
    totalFormaB: int = 0

    extralaboralA: Optional[ExtralaboralStats] = None
    extralaboralB: Optional[ExtralaboralStats] = None
    estresA: Optional[StressStats] = None
    estresB: Optional[StressStats] = None

class DashboardResponse(BaseModel):
    demographics: DashboardDemographics
    intralaboral: IntralaboralStats
