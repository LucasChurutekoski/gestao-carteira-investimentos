import { Button, Text, TextInput, View, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from 'react'
import axios from "axios";
import * as SecureStorage from 'expo-secure-store'
import { SafeAreaView } from "react-native-safe-area-context";


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')



    const handleLogin = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3000/autenticacao/login', { email: email, senha: senha });
            const token = response.data.token_acesso

            if (token) {
                await SecureStorage.setItemAsync('token', token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                navigation.replace("Home")
            }
        } catch (error) {
            Alert.alert(
                "Erro ao efetuar Login",
                "Email ou senha incorretos",
                [
                    {
                        text: "Tentar Novamente"
                    },
                ],
            )
        }
    }

    function irParaTelaDeCadastro() {
        navigation.navigate("CriarConta")
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#000",
            paddingHorizontal: 30,
            alignItems: "center",
            paddingTop: 50
        },
        text: {
            color: "white",
            margin: 15,
            textTransform: "uppercase", 
            marginBottom: 10
        },
        TextInput: {
            backgroundColor: "#505050",
            borderRadius: 10,
            color: "#FFF"
        },
        Button: {
            backgroundColor: "#9333ea",
            padding: 15,
            borderRadius: 10,
            textAlign: "center",
            marginTop: 20,
            marginBottom: 40,
            shadowColor: "#A020F0"
        },
        buttonText:{
            color:"white",
            fontWeight: 700,
            textTransform: "uppercase",
            textAlign: "center"
        }, 
        textNovoNoSistema: {
            color: "white", 
            paddingTop: 10
        }
    });

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.text}>Bem vindo ao Sistema</Text>

                <Text style={styles.text}>Email</Text>
                <TextInput style={styles.TextInput} placeholder="Digite seu email" onChangeText={setEmail}></TextInput>

                <Text style={styles.text}>Senha</Text>
                <TextInput style={styles.TextInput} secureTextEntry={true} placeholder="Digite sua senha" onChangeText={setSenha}></TextInput>
               
                <TouchableOpacity 
                style={styles.Button}
                onPress={handleLogin}
                >
                    <Text style={styles.buttonText}>Realizar Login</Text>
                </TouchableOpacity>

                <Text style={styles.textNovoNoSistema}>Novo no sistema?</Text>

                <TouchableOpacity
                    style={styles.Button}
                    onPress={irParaTelaDeCadastro}
                >
                    <Text style={styles.buttonText}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )

}