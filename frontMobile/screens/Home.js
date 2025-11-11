import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";
import { Button, Text, View } from "react-native";
import { useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import MenuBottom from "../components/MenuBottom";
import GraficoRentabilidade from "../components/GraficoRentabilidade";

export default function Home({ navigation }) {

    const [usuario, setUsuario] = useState(null)
    const [dadosProtegidos, setDadosProtegidos] = useState(null)

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
    }, [])

    function abrirModalTransacao() {
        navigation.navigate("novaTransacaoModal")
    }
    return (
        <SafeAreaView>
            <Header />
            {usuario ?
                (
                    <View>
                        <Text>Bem-vindo(a), {usuario.nomeUsuario}!</Text>
                        <GraficoRentabilidade />
                    </View>
                ) : (
                    <Text>Carregando dados...</Text>
                )}

            <Button
                title="+"
                onPress={abrirModalTransacao}

            />
            <MenuBottom />
        </SafeAreaView>
    )
}