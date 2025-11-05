import { Button, Text, TextInput, View, Alert } from "react-native"
import { useState } from 'react'
import axios from "axios";

export default function CriarConta({ navigation }) {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmacaoSenha, setconfirmacaoSenha] = useState('')

    const criacaoDeConta = async () => {
        try {
            if (senha !== confirmacaoSenha) {
                Alert.alert(
                    "Senhas não conferem",
                    "",
                    [
                        {
                            text: "Tentar Novamente"
                        },
                    ],)
                return
            }
            const response = await axios.post('http://10.0.2.2:3000/usuarios', { nome: nome, email: email, senha: senha })
            if (response.status === 201) {
                Alert.alert("Sucesso!", "Sua conta foi criada com sucesso")
                navigation.replace("Login")
            }
        } catch (error) {
            const mensagemApi = error.response.data.message
            Alert.alert(
                "Erro ao criar conta",
                mensagemApi,
                [
                    {
                        text: "Tentar Novamente"
                    },
                ],
            )
        }
    }

    return (
        <View>
            <Text>Cadastrar-se</Text>
            <Text></Text>
            <Text>Nome:</Text>
            <TextInput placeholder="digite seu nome" onChangeText={setNome} />
            <Text>Email</Text>
            <TextInput placeholder="digite seu email" onChangeText={setEmail} />
            <Text>Senha</Text>
            <TextInput placeholder="digite sua senha" onChangeText={setSenha} />
            <Text>Confirmar senha</Text>
            <TextInput placeholder="digite sua senha novamente" onChangeText={setconfirmacaoSenha} />
            <Button
                title="Criar Conta"
                onPress={criacaoDeConta}
            />
        </View>
    )
}