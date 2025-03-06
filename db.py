from pymongo import MongoClient
from datetime import datetime

# Conectar ao MongoDB
client = MongoClient("mongodb+srv://adm:adm@cluster0.beqg7.mongodb.net/")
db = client["ProcessoRVCC"]

# Criar coleções
tecnicos = db["tecnicos"]
formadores = db["formadores"]
sumarios = db["sumarios"]
areas = db["areas"]
form_areas = db["form_areas"]
sessoes = db["sessoes"]
sessao_sum = db["sessao_sum"]
candidatos = db["candidatos"]
candidato_sum = db["candidato_sum"]

# Inserir dados de exemplo
id_tec = tecnicos.insert_one({"nome": "João Silva"}).inserted_id
id_form = formadores.insert_one({"nome_form": "Maria Ferreira"}).inserted_id
id_area = areas.insert_one({"nome": "TI", "niveis": ["Básico", "Avançado"]}).inserted_id
id_sum = sumarios.insert_one({"id_tec": id_tec, "tipo_sum": "Aula Teórica", "status": "Concluído"}).inserted_id
id_sessao = sessoes.insert_one({
    "descricao": "Introdução ao MongoDB",
    "data": datetime.utcnow(),
    "etapa": "Módulo 1",
    "duracao": "3h"
}).inserted_id

# Relacionamentos
form_areas.insert_one({"id_form": id_form, "id_areas": id_area})
sessao_sum.insert_one({"id_sessao": id_sessao, "id_sum": id_sum})

# Inserir candidato
id_candidato = candidatos.insert_one({
    "sigo": "SIGO123",
    "id_tec": id_tec,
    "nome": "Carlos Andrade",
    "email": "carlos@email.com",
    "nivel_a_obter": "Avançado",
    "data_inscricao": datetime.utcnow(),
    "telemovel": "912345678",
    "observacao": "Nenhuma",
    "data_ultima_sessao": datetime.utcnow(),
    "documentos": {
        "FI": True,
        "CC": False,
        "CH": True,
        "Diag": False,
        "Presenca": True,
        "PIE": False,
        "Contrato": True,
        "FCI": False,
        "FCE": True,
        "Presencas_rvcc": 5,
        "Presencas_FC": 3,
        "Portfolio": "Link para Portfolio",
        "Grelhas_Formadores": "Grelha Preenchida",
        "Sessao_Validacao": True,
        "Preparacao_Juri": False
    },
    "situacao_atividade": "Ativo",
    "nif": "123456789",
    "num_doc_id": "AB123456",
    "niss": "987654321",
    "habilitacoes": "Ensino Secundário",
    "qualificacao": "Curso X",
    "data_nascimento": datetime(1990, 1, 1),
    "situacao_emprego": "Desempregado",
    "data_desemprego": datetime(2023, 6, 1)
}).inserted_id

candidato_sum.insert_one({"sigo": "SIGO123", "id_sum": id_sum})

print("Base de dados criada com sucesso!")
