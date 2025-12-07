import { Button, Text, TextInput, View, Alert, StyleSheet, TouchableOpacity } from "react-native"
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

       const styles = StyleSheet.create({
       container: {
            flex: 1,
            backgroundColor: "#000",
            paddingHorizontal: 80,
            justifyContent: "center",
            width: '100%'
        },
        title: {
            textAlign: "center",
            color: "white",
            marginVertical: 30,
            textTransform: "uppercase",
            fontWeight: 'bold',
        },
        text: {
            color: "white",
            marginLeft: 10,
            marginVertical: 10,
            textTransform: "uppercase",
            fontWeight: 'bold',
            fontSize: 12
        },
        textInput: {
            backgroundColor: "#505050",
            borderRadius: 10,
            paddingHorizontal: 20, 
            height: 55,
            color: '#FFF',
            width: '100%'
        },
        Button: {
            backgroundColor: "#9333ea",
            padding: 15,
            borderRadius: 10,
            marginTop: 40,
            marginBottom: 40,
            alignItems: 'center',
            shadowColor: "#A020F0",
            elevation: 5
        },
        buttonText:{
            color:"white",
            fontWeight: "bold",
            textTransform: "uppercase",
            textAlign: "center"
        }
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadastrar-se</Text>
            <Text></Text>
            <Text style={styles.text}>Nome:</Text>
            <TextInput style={styles.textInput} placeholder="digite seu nome" onChangeText={setNome} />
            <Text style={styles.text}>Email</Text>
            <TextInput style={styles.textInput} placeholder="digite seu email" onChangeText={setEmail} />
            <Text style={styles.text}>Senha</Text>
            <TextInput style={styles.textInput} placeholder="digite sua senha" onChangeText={setSenha} />
            <Text style={styles.text}>Confirmar senha</Text>
            <TextInput style={styles.textInput} placeholder="digite sua senha novamente" onChangeText={setconfirmacaoSenha} />
            <TouchableOpacity
                style={styles.Button}
                onPress={criacaoDeConta}
            >
                <Text style={styles.buttonText}>Criar conta</Text>
            </TouchableOpacity>
        </View>
    )

    }