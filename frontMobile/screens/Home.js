import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import MenuBottom from "../components/MenuBottom";
import GraficoRentabilidade from "../components/GraficoRentabilidade";

export default function Home({ navigation }) {

    const [usuario, setUsuario] = useState(null)
    const [dadosProtegidos, setDadosProtegidos] = useState('')

    useEffect(() => {
        const buscaToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('token')
                if (token) {
                    const dadosToken = jwtDecode(token)
                    setUsuario(dadosToken)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get('http:10.0.2.2:3000/carteira')
                    setDadosProtegidos(response.data)
                }
            } catch (error) {

            }
        }
        buscaToken()
    }, )

    function abrirModalTransacao() {
        navigation.navigate("novaTransacaoModal")
    }

    const styles = StyleSheet.create({
        container: {
            backgroundColor: '#F2F2F2',
            flex: 1,
            paddingTop: 40,
            alignItems: 'center',
            justifyContent: 'flex-start'
        },
        Title: {
            fontSize: 18,
            color: '#333',
            marginBottom: 20,
            textAlign: 'center',
        },
        Button: {
            position: 'absolute',
            bottom: 80,
            right: 20,
            backgroundColor: '#A020F0',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: "#A020F0",
        },
        Text: {
            color: '#FFF',
            fontSize: 30,
            marginTop: -3,
        }
    });
    return (
        <SafeAreaView style={styles.container}>
            {usuario ?
                (
                    <View>
                        <Text style={styles.Title}>Valor total investido: {dadosProtegidos?.valorAtual?.toFixed(2) ?? '0.00'}</Text>
                        <Text style={styles.Title}>Rentabilidade: {((dadosProtegidos.rentabilidadeGeral ?? 0) * 100).toFixed(2)}%</Text>
                        <Text style={styles.Title}>Bem-vindo(a), {usuario.nomeUsuario}!</Text>
                        <GraficoRentabilidade />

                        <FlatList
                            data={dadosProtegidos.posicoes}
                            renderItem={({ item }) =>
                                <View>
                                    <Text></Text>
                                    <Text>Ticker da ação :{item.ativo.ticker}</Text>
                                    <Text>Quantidade : {item.quantidade}</Text>
                                    <Text>preço médio pago : {(item.precoMedio).toFixed(2)}</Text>
                                    <Text>valor total investido: {(item.valorTotalInvestido).toFixed(2)}</Text>
                                    <Text>valor atual: {(item.valorAtual).toFixed(2)}</Text>
                                    <Text>rentabilidade do ativo: {(item.rentabilidade * 100).toFixed(2)}</Text>
                                </View>
                            }
                            keyExtractor={item => item.idAtivo}
                        />
                    </View>
                ) : (
                    <Text>Carregando dados...</Text>
                )}

            <TouchableOpacity
                style={styles.Button}
                onPress={abrirModalTransacao}
            >
                <Text style={styles.Text}>+</Text>
            </TouchableOpacity>

            <MenuBottom navigation={navigation} />
        </SafeAreaView>
    )
}