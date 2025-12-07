import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";
import { Text, View, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import MenuBottom from "../components/MenuBottom";

export default function MinhaConta({ navigation }) {

    const [dadosUsuario, setDadosUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregarDadosDoUsuario = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');

                if (!token) {
                    Alert.alert("Erro", "Usuário não autenticado");
                    setLoading(false);
                    return;
                }

                const decoded = jwtDecode(token);
                const userId = decoded.sub;
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                const response = await axios.get(`http://10.0.2.2:3000/usuarios/${userId}`);

                setDadosUsuario(response.data);

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
            } finally {
                setLoading(false);
            }
        };

        carregarDadosDoUsuario();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.containerLoading}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Carregando dados...</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header />
            
            <View>
                {dadosUsuario ? (
                    <View>
                        <Text style={styles.welcomeText}>
                            Bem-vindo(a), {dadosUsuario.nomeUsuario || dadosUsuario.nome}!
                        </Text>
                        <Text>Email: {dadosUsuario.email}</Text>
                    </View>
                ) : (
                    <Text>Não foi possível carregar os dados do usuário.</Text>
                )}
            </View>

            <MenuBottom navigation={navigation} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    containerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    }
});