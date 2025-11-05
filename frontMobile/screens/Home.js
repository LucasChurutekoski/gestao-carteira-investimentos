import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";
import { Text } from "react-native";
import { useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'

export default function Home() {

    const[usuario, setUsuario]= useState(null)

    useEffect(() => {
        const buscaToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('token')
                if (token) {
                    const dadosToken = jwtDecode(token)
                    setUsuario(dadosToken)
                }
            } catch (error) {

            }

        }
        buscaToken()
    }, [])
    return (
        <SafeAreaView>
            <Header />
            {usuario ? (<Text>Bem-vindo(a), {usuario.nomeUsuario}!</Text>) : (
                <Text>Carregando dados...</Text>
            )   }
        </SafeAreaView>
    )
}