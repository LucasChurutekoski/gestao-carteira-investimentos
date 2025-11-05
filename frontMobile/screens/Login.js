import { Button, Text, TextInput, View, Alert } from "react-native";
import { useState } from 'react'
import axios from "axios";
import * as SecureStorage from 'expo-secure-store'


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
    return (
        <View>
            <Text>Bem vindo ao Sistema</Text>

            <Text>Email</Text>
            <TextInput placeholder="Digite seu email" onChangeText={setEmail}></TextInput>

            <Text>Senha</Text>
            <TextInput type="password" placeholder="Digite sua senha" onChangeText={setSenha}></TextInput>
            <Button
                title="Realizar Login"
                onPress={handleLogin}
            />

            <Text>Novo no sistema?</Text>
            <Button
                title="Cadastrar-se"
                onPress={irParaTelaDeCadastro}
            />
        </View>
    )
}