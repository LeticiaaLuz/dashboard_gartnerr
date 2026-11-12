
import json
import re
import requests
import paho.mqtt.client as mqtt

# Configuracoes MQTT
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_TOPIC = "rega/plantas/leituras"

# Endereco do FastAPI
API_URL = "http://127.0.0.1:8000"



def on_connect(client, userdata, flags, reason_code, properties):

    if not reason_code.is_failure:
        print("Conectado ao MQTT!")
        client.subscribe(MQTT_TOPIC)
        print("Aguardando mensagens...")
    else:
        print("Erro MQTT:", reason_code)




def on_message(client, userdata, msg):
    try:
        # 1. Recebe o JSON enviado pelo ESP32
        dados = json.loads(msg.payload.decode("utf-8"))

        if not isinstance(dados, dict):
            print("JSON invalido")
            return

        # 2. Recupera o MAC do ESP32
        mac = dados.get("id")

        if not isinstance(mac, str):
            print("Campo id nao encontrado")
            return

        # Padroniza o endereco MAC
        mac = mac.replace(":", "").replace("-", "").upper()

        if not re.fullmatch(r"[0-9A-F]{12}", mac):
            print("MAC invalido")
            return

        print("\nMensagem MQTT recebida!")
        print("MAC:", mac)
        print("Dados:", dados)

        # 3. Consulta as plantas cadastradas na API
        resposta = requests.get(
            f"{API_URL}/plants",
            timeout=5
        )

        resposta.raise_for_status()
        plantas = resposta.json()

        # 4. Procura a planta com o mesmo MAC
        planta_encontrada = next(
            (
                planta for planta in plantas
                if isinstance(planta.get("device_id"), str)
                and planta["device_id"]
                    .replace(":", "")
                    .replace("-", "")
                    .upper() == mac
            ),
            None
        )

        if planta_encontrada is None:
            print("Nenhuma planta cadastrada com esse MAC")
            return

        plant_id = planta_encontrada["id"]

        print("Planta encontrada:", planta_encontrada["nickname"])
        print("ID interno:", plant_id)

        # 5. Prepara os dados para o FastAPI
        leitura = dados.copy()
        leitura.pop("id", None)

        # 6. Envia as leituras para a rota correta
        resposta = requests.post(
            f"{API_URL}/plants/{plant_id}/readings",
            json=leitura,
            timeout=5
        )

        print("Resposta HTTP:", resposta.status_code)
        print("Resposta API:", resposta.text)

        if resposta.status_code == 201:
            print("Leitura registrada com sucesso!")
        else:
            print("Falha ao registrar leitura")

    except (json.JSONDecodeError, UnicodeDecodeError):
        print("Mensagem JSON invalida")

    except requests.RequestException as erro:
        print("Erro de comunicacao com FastAPI:", erro)

    except (KeyError, TypeError, ValueError) as erro:
        print("Erro ao processar dados:", erro)




client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="gartner-mqtt-receiver"
)

client.on_connect = on_connect
client.on_message = on_message

print("Iniciando receptor MQTT...")

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()
