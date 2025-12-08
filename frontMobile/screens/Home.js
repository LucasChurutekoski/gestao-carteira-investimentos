import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    cardLabel: {
        fontSize: 16,
        color: '#000',
        marginBottom: 10,
    },
    cardValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    whiteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        minHeight: 300,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    Title: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    Container: {
        flex: 1,
        alignItems: 'center', 
        justifyContent: 'center'
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
        <SafeAreaView>
            {usuario ?
                (
                    <View>
                        <Text style={styles.Title}>Bem-vindo(a), {usuario.nomeUsuario}!</Text>
                        <GraficoRentabilidade />
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