import { useEffect, useState } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { View, Text } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import moment from 'moment'

export default function GraficoRentabilidade() {

    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [estaCarregando, setEstaCarregando] = useState(true);

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                if (!token) {
                    console.log("Nenhum token encontrado");
                    setEstaCarregando(false);
                    return;
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const resposta = await axios.get("http://10.0.2.2:3000/carteira/rentabilidade");
                const dadosDaApi = resposta.data;
                const dadosFormatados = dadosDaApi.map((ponto, index) => {
                    
                    
                    const rentabilidadePercentual = Number(ponto.rentabilidade) || 0

                    const mostrarLabel = dadosDaApi.length > 10 && index % 2 === 0;

                    return {
                        value: rentabilidadePercentual,
                        label: mostrarLabel ? moment(ponto.data).format('DD/MM') : null
                    }
                });

                setDadosGrafico(dadosFormatados);

            } catch (erro) {
                console.error("Erro ao buscar dados do gráfico:", erro);
            } finally {
                setEstaCarregando(false);
            }
        };

        buscarDados();
    }, []);

    if (estaCarregando) {
        return (
            <View style={{ padding: 20 }}>
                <Text>Carregando gráfico...</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Rentabilidade da Carteira (%)
            </Text>
            
            {dadosGrafico.length > 0 ? (
                <LineChart
                    data={dadosGrafico}
                    color="#007AFF"
                    thickness={3}
                    curved
                    yAxisTextStyle={{ color: 'gray' }}
                    xAxisLabelTextStyle={{ color: 'gray' }}
                    yAxisLabelSuffix="%"
                    pointerConfig={{
                        pointerLabelSuffix: "%"
                    }}
                />
            ) : (
                <Text>Não há dados históricos para exibir.</Text>
            )}
        </View>
    );
}