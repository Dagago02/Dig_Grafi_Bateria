from collections import defaultdict
from sqlalchemy.orm import Session
from app.schemas.dashboard import (
    DashboardResponse, DashboardDemographics, IntralaboralStats,
    ChartData, RiskLevelData, ExtralaboralStats, StressStats
)
from app.models.participant import Participant
from app.models.result import Result
from app.models.answer import Answer
from app.models.question import Question

def calculate_age_range(age: int) -> str:
    if age <= 25: return "18-25 años"
    if age <= 35: return "26-35 años"
    if age <= 45: return "36-45 años"
    if age <= 55: return "46-55 años"
    return "Más de 55 años"

def get_years_range(val: str) -> str:
    if not val:
        return "No especificado"
    val_str = str(val).strip().lower()
    if "menos" in val_str or "sí" in val_str or "si" in val_str:
        return "Menos de un año"
    try:
        years = float(val_str)
        if years < 1: return "Menos de un año"
        if years <= 5: return "1 a 5 años"
        if years <= 10: return "6 a 10 años"
        if years <= 20: return "11 a 20 años"
        return "21 o más"
    except ValueError:
        return val

def create_chart_data(counter_dict: dict) -> list[ChartData]:
    # Filter out None keys
    filtered = {str(k) if k is not None else "No especificado": v for k, v in counter_dict.items()}
    total = sum(filtered.values())
    if total == 0:
        return []
    return [
        ChartData(name=str(k), value=v, percentage=round((v / total) * 100, 1))
        for k, v in filtered.items()
    ]

def init_risk_data(name: str) -> RiskLevelData:
    return RiskLevelData(
        name=name, muyAlto=0, alto=0, medio=0, bajo=0, sinRiesgo=0, total=0
    )

def add_to_risk(risk_obj: RiskLevelData, level: str):
    risk_obj.total += 1
    level_lower = (level or "").lower()
    if "muy alto" in level_lower: risk_obj.muyAlto += 1
    elif "alto" in level_lower: risk_obj.alto += 1
    elif "medio" in level_lower: risk_obj.medio += 1
    elif "bajo" in level_lower: risk_obj.bajo += 1
    else: risk_obj.sinRiesgo += 1

def init_extralaboral_stats(suffix: str) -> ExtralaboralStats:
    return ExtralaboralStats(
        tiempoFueraTrabajo=init_risk_data("Tiempo fuera del trabajo"),
        relacionesFamiliares=init_risk_data("Relaciones familiares"),
        comunicacionRelaciones=init_risk_data("Comunicación y relaciones interpersonales"),
        situacionEconomica=init_risk_data("Situación económica del grupo familiar"),
        caracteristicasVivienda=init_risk_data("Características de la vivienda y de su entorno"),
        influenciaEntorno=init_risk_data("Influencia del entorno extralaboral sobre el trabajo"),
        desplazamientoVivienda=init_risk_data("Desplazamiento vivienda-trabajo-vivienda"),
        consolidadoExtralaboral=init_risk_data(f"Consolidado Extralaboral {suffix}"),
        total=0
    )

def init_stress_stats(suffix: str) -> StressStats:
    return StressStats(
        fisiologico=init_risk_data("Fisiológicos"),
        psicoemocional=init_risk_data("Psicoemocionales"),
        psicologico=init_risk_data("Cognitivos y comportamentales"),
        social=init_risk_data("Sociales"),
        consolidadoEstres=init_risk_data(f"Consolidado Estrés {suffix}"),
        total=0
    )

def generate_dashboard_stats(participants: list[Participant], all_results: list[Result], db: Session) -> DashboardResponse:
    """
    Generates consolidated dashboard statistics from participant and result data.
    Pulls demographic data from both the Participant model and the Answer table.
    """
    participant_ids = [p.id for p in participants]

    # Query demographic answers from Ficha de Datos Generales (datos_generales)
    general_answers = db.query(Answer).join(Question).filter(
        Answer.participant_id.in_(participant_ids),
        Question.forma == "datos_generales"
    ).all()

    # Group answers by participant_id and question number
    answers_by_part = defaultdict(dict)
    for ans in general_answers:
        answers_by_part[ans.participant_id][ans.pregunta.numero] = ans.value

    # 1. Demographics
    sexo_counts = defaultdict(int)
    estado_civil_counts = defaultdict(int)
    nivel_educativo_counts = defaultdict(int)
    tipo_contrato_counts = defaultdict(int)
    tiempo_empresa_counts = defaultdict(int)
    cargo_counts = defaultdict(int)
    area_counts = defaultdict(int)
    tipo_forma_counts = defaultdict(int)
    edad_counts = defaultdict(int)
    
    # Answers-derived demographics
    estrato_counts = defaultdict(int)
    tipo_vivienda_counts = defaultdict(int)
    personas_counts = defaultdict(int)
    ant_cargo_counts = defaultdict(int)
    tipo_salario_counts = defaultdict(int)

    for p in participants:
        # DB fields
        if p.sexo: sexo_counts[p.sexo] += 1
        if p.estado_civil: estado_civil_counts[p.estado_civil] += 1
        if p.nivel_educativo: nivel_educativo_counts[p.nivel_educativo] += 1
        if p.tipo_contrato: tipo_contrato_counts[p.tipo_contrato] += 1
        if p.tiempo_empresa: tiempo_empresa_counts[p.tiempo_empresa] += 1
        if p.cargo: cargo_counts[p.cargo] += 1
        if p.area: area_counts[p.area] += 1
        if p.tipo_forma: tipo_forma_counts[p.tipo_forma] += 1
        if p.edad:
            edad_counts[calculate_age_range(p.edad)] += 1

        # Answers fields (Ficha de Datos Generales)
        p_answers = answers_by_part.get(p.id, {})
        
        # Q8: Estrato
        estrato_val = p_answers.get(8)
        if estrato_val: estrato_counts[estrato_val] += 1
        
        # Q9: Tipo de vivienda
        vivienda_val = p_answers.get(9)
        if vivienda_val: tipo_vivienda_counts[vivienda_val] += 1
        
        # Q10: Personas a cargo
        personas_val = p_answers.get(10)
        if personas_val: personas_counts[personas_val] += 1
        
        # Q15: Antigüedad en el cargo
        ant_val = p_answers.get(15)
        if ant_val: ant_cargo_counts[get_years_range(ant_val)] += 1
        
        # Q19: Tipo de salario
        salario_val = p_answers.get(19)
        if salario_val: tipo_salario_counts[salario_val] += 1

    demo = DashboardDemographics(
        totalEmployees=len(participants),
        sexo=create_chart_data(sexo_counts),
        estadoCivil=create_chart_data(estado_civil_counts),
        escolaridad=create_chart_data(nivel_educativo_counts),
        estrato=create_chart_data(estrato_counts),
        tipoVivienda=create_chart_data(tipo_vivienda_counts),
        personasACargo=create_chart_data(personas_counts),
        antiguedadEmpresa=create_chart_data(tiempo_empresa_counts),
        tipoCargo=create_chart_data(cargo_counts),
        antiguedadCargo=create_chart_data(ant_cargo_counts),
        tipoContrato=create_chart_data(tipo_contrato_counts),
        tipoSalario=create_chart_data(tipo_salario_counts),
        rangosEdad=create_chart_data(edad_counts),
    )

    # 2. Risk Levels — build from stored results
    # Map participant_id -> tipo_forma
    forma_map = {p.id: (p.tipo_forma or 'A') for p in participants}

    intra = IntralaboralStats()
    intra.consolidado_A = init_risk_data("Consolidado Intra A")
    intra.consolidado_B = init_risk_data("Consolidado Intra B")
    
    extra_A = init_extralaboral_stats("A")
    extra_B = init_extralaboral_stats("B")
    
    estres_A = init_stress_stats("A")
    estres_B = init_stress_stats("B")

    # Tracking sets to avoid over-counting totals per participant
    extra_counted_participants = set()
    estres_counted_participants = set()

    for r in all_results:
        forma = forma_map.get(r.participant_id, 'A')
        nivel = r.nivel_riesgo or "Sin Riesgo"

        # INTRALABORAL
        if r.componente in ["intralaboral_A", "intralaboral_B"] or (r.tipo_resultado == "general" and r.nombre_target == "intralaboral"):
            if r.tipo_resultado == "general":
                if forma == 'A':
                    add_to_risk(intra.consolidado_A, nivel)
                    intra.totalFormaA += 1
                else:
                    add_to_risk(intra.consolidado_B, nivel)
                    intra.totalFormaB += 1

            elif r.tipo_resultado == "dominio":
                if forma == 'A':
                    if r.nombre_target not in intra.dominios_A:
                        intra.dominios_A[r.nombre_target] = init_risk_data(r.nombre_target)
                    add_to_risk(intra.dominios_A[r.nombre_target], nivel)
                else:
                    if r.nombre_target not in intra.dominios_B:
                        intra.dominios_B[r.nombre_target] = init_risk_data(r.nombre_target)
                    add_to_risk(intra.dominios_B[r.nombre_target], nivel)

            elif r.tipo_resultado == "dimension":
                if forma == 'A':
                    if r.nombre_target not in intra.dimensiones_A:
                        intra.dimensiones_A[r.nombre_target] = init_risk_data(r.nombre_target)
                    add_to_risk(intra.dimensiones_A[r.nombre_target], nivel)
                else:
                    if r.nombre_target not in intra.dimensiones_B:
                        intra.dimensiones_B[r.nombre_target] = init_risk_data(r.nombre_target)
                    add_to_risk(intra.dimensiones_B[r.nombre_target], nivel)

        # EXTRALABORAL
        elif r.componente == "extralaboral" or r.nombre_target == "extralaboral":
            target_extra = extra_A if forma == 'A' else extra_B
            
            if r.tipo_resultado == "general":
                add_to_risk(target_extra.consolidadoExtralaboral, nivel)
                if r.participant_id not in extra_counted_participants:
                    target_extra.total += 1
                    extra_counted_participants.add(r.participant_id)
            elif r.tipo_resultado == "dimension":
                mapping = {
                    "Tiempo fuera del trabajo": target_extra.tiempoFueraTrabajo,
                    "Relaciones familiares": target_extra.relacionesFamiliares,
                    "Comunicación y relaciones interpersonales": target_extra.comunicacionRelaciones,
                    "Situación económica del grupo familiar": target_extra.situacionEconomica,
                    "Características de la vivienda y de su entorno": target_extra.caracteristicasVivienda,
                    "Influencia del entorno extralaboral sobre el trabajo": target_extra.influenciaEntorno,
                    "Desplazamiento vivienda-trabajo-vivienda": target_extra.desplazamientoVivienda
                }
                obj = mapping.get(r.nombre_target)
                if obj:
                    add_to_risk(obj, nivel)

        # ESTRES
        elif r.componente == "estres" or r.nombre_target == "estres":
            target_estres = estres_A if forma == 'A' else estres_B
            
            if r.tipo_resultado == "general":
                add_to_risk(target_estres.consolidadoEstres, nivel)
                if r.participant_id not in estres_counted_participants:
                    target_estres.total += 1
                    estres_counted_participants.add(r.participant_id)
            elif r.tipo_resultado == "dimension":
                mapping = {
                    "Fisiológicos": target_estres.fisiologico,
                    "Psicoemocionales": target_estres.psicoemocional,
                    "Cognitivos y comportamentales": target_estres.psicologico,
                    "Sociales": target_estres.social
                }
                obj = mapping.get(r.nombre_target)
                if obj:
                    add_to_risk(obj, nivel)

    # Attach the stats to intra (always attach even if 0, so tabs are always present)
    intra.extralaboralA = extra_A
    intra.extralaboralB = extra_B
    intra.estresA = estres_A
    intra.estresB = estres_B

    return DashboardResponse(
        demographics=demo,
        intralaboral=intra
    )
