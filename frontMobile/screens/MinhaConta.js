import { SafeAreaView } from "react-native-safe-area-context";

import { Text, View, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import MenuBottom from "../components/MenuBottom";

export default function MinhaConta({ navigation }) {

    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [userId, setUserId] = useState(null);

    async function excluirConta() {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert("Erro", "Usuário não autenticado");
                return;
            }
            
            if (!userId) {
                Alert.alert("Erro", "ID do usuário não encontrado.");
                return;
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Alert.alert(
                "Excluir Conta",
                "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
                [
                    { text: "Cancelar", style: "cancel" },
                    { 
                        text: "Excluir", 
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await axios.delete(`http://10.0.2.2:3000/usuarios/${userId}`);
                                await SecureStore.deleteItemAsync('token');
                                navigation.navigate('Login');
                            } catch (err) {
                                Alert.alert("Erro", "Não foi possível excluir a conta.");
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro ao tentar excluir.");
        }
    }

    async function salvarDados() {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token || !userId) {
                Alert.alert("Erro", "Sessão inválida.");
                return;
            }

            if (!nome || !email) {
                Alert.alert("Atenção", "Nome e Email não podem ficar vazios.");
                return;
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const dadosAtualizados = {
                nome: nome,
                email: email
            };

            if (senha.length > 0) {
                dadosAtualizados.senha = senha;
            }

            await axios.patch(`http://10.0.2.2:3000/usuarios/${userId}`, dadosAtualizados);
            
            Alert.alert("Sucesso", "Dados atualizados com sucesso!");
            setSenha(''); 

        } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar os dados.");
        }
    }

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
                const idExtraido = decoded.sub;
                setUserId(idExtraido);

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const response = await axios.get(`http://10.0.2.2:3000/usuarios/${idExtraido}`);
                
                setNome(response.data.nomeUsuario || response.data.nome);
                setEmail(response.data.email);

            } catch (error) {
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
                <ActivityIndicator size="large" color="#5A45FF" />
                <Text style={{color: '#FFF', marginTop: 10}}>Carregando dados...</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.pageTitle}>Minha conta</Text>
                    <Text style={styles.pageSubtitle}>Editar dados da conta</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>NOME</Text>
                    <TextInput 
                        style={styles.input} 
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Seu nome"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-MAIL</Text>
                    <TextInput 
                        style={styles.input} 
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Seu email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>SENHA</Text>
                    <TextInput 
                        style={styles.input} 
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Nova senha (opcional)" 
                        placeholderTextColor="#999"
                        secureTextEntry={true}
                    />
                </View>

                <TouchableOpacity style={styles.buttonSave} onPress={salvarDados}>
                    <Text style={styles.buttonSaveText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonDelete} onPress={excluirConta}>
                    <Text style={styles.buttonDeleteText}>Excluir minha conta</Text>
                </TouchableOpacity>

            </ScrollView>

            <MenuBottom navigation={navigation} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    containerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 100
    },
    headerTitleContainer: {
        marginBottom: 30,
        alignItems: 'flex-start'
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#CCCCCC',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1
    },
    input: {
        backgroundColor: '#575757',
        borderRadius: 25,
        height: 50,
        paddingHorizontal: 20,
        color: '#FFFFFF',
        fontSize: 16
    },
    buttonSave: {
        backgroundColor: '#5A45FF',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20
    },
    buttonSaveText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    buttonDelete: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    buttonDeleteText: {
        color: '#FF4545',
        fontSize: 14,
    }
});