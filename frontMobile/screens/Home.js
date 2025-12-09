import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import MenuBottom from "../components/MenuBottom";
import GraficoRentabilidade from "../components/GraficoRentabilidade";

export default function Home({ navigation }) {

    const [usuario, setUsuario] = useState(null);
    const [dadosProtegidos, setDadosProtegidos] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const buscaDados = async () => {
                try {
                    const token = await SecureStore.getItemAsync('token');
                    if (token) {
                        const dadosToken = jwtDecode(token);
                        setUsuario(dadosToken);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        const response = await axios.get('http://10.0.2.2:3000/carteira');
                        setDadosProtegidos(response.data);
                    }
                } catch (error) {
                    console.log(error);
                }
            };
            buscaDados();
        }, [])
    );

    function abrirModalTransacao() {
        navigation.navigate("novaTransacaoModal");
    }

    const renderHeader = () => {
        if (!usuario || !dadosProtegidos) return null;

        return (
            <View>
                <Text style={styles.Title}>Bem-vindo(a), {usuario.nomeUsuario}!</Text>

                <View style={styles.cardRoxo}>
                    <Text style={styles.valorTotalLabel}>Valor Total Investido</Text>
                    <Text style={styles.valorTotal}>
                        R$ {dadosProtegidos?.valorAtual?.toFixed(2) ?? '0.00'}
                    </Text>
                    
                    <View style={styles.linhaRentabilidade}>
                        <Text style={styles.labelRentabilidade}>Rentabilidade (Mês)</Text>
                        <Text style={styles.textoRentabilidade}>
                            {((dadosProtegidos.rentabilidadeGeral ?? 0) * 100).toFixed(2)}%
                        </Text>
                    </View>
                </View>

                <GraficoRentabilidade />

                <Text style={styles.subtitulo}>Evolução do patrimônio</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            
            {!dadosProtegidos ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#A020F0" />
                </View>
            ) : (
                <FlatList
                    data={dadosProtegidos.posicoes}
                    ListHeaderComponent={renderHeader} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
                    keyExtractor={(item, index) => String(index)}
                    renderItem={({ item }) => {
                        const isLucro = item.rentabilidade >= 0;
                        return (
                            <View style={styles.cardAtivo}>
                                <View style={styles.linhaSuperior}>
                                    <Text style={styles.ticker}>{item.ativo.ticker}</Text>
                                    <Text style={styles.valorAtual}>R$ {(item.valorAtual || 0).toFixed(2)}</Text>
                                </View>

                                <View style={styles.linhaDetalhes}>
                                    <Text style={styles.textoDetalhe}>Qtd: {item.quantidade}</Text>
                                    <Text style={styles.textoDetalhe}>Médio: R$ {(item.precoMedio || 0).toFixed(2)}</Text>
                                </View>

                                <View style={styles.separador} />

                                <View style={styles.linhaInferior}>
                                    <View>
                                        <Text style={styles.rotulo}>Total Investido</Text>
                                        <Text style={styles.valorInvestido}>R$ {(item.valorTotalInvestido || 0).toFixed(2)}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.rotulo}>Rentabilidade</Text>
                                        <Text style={[styles.rentabilidade, { color: isLucro ? '#00C853' : '#FF3D00' }]}>
                                            {isLucro ? '+' : ''}{(item.rentabilidade * 100).toFixed(2)}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            <TouchableOpacity style={styles.Button} onPress={abrirModalTransacao}>
                <Text style={styles.TextButton}>+</Text>
            </TouchableOpacity>

            <MenuBottom navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    Title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 20,
        marginTop: 20,
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginTop: 10,
    },
    Button: {
        position: 'absolute',
        bottom: 90, 
        right: 20,
        backgroundColor: '#A020F0',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#A020F0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 99,
    },
    TextButton: {
        color: '#FFF',
        fontSize: 32,
        marginTop: -4,
        fontWeight: '300',
    },
    cardRoxo: {
        width: '100%',
        backgroundColor: '#A020F0',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        elevation: 8,
        shadowColor: "#A020F0",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
    },
    valorTotalLabel: {
        fontSize: 14,
        color: '#E0E0E0',
        marginBottom: 5,
    },
    valorTotal: {
        fontSize: 32, 
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
    },
    linhaRentabilidade: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    labelRentabilidade: {
        fontSize: 14,
        color: '#DDD',
    },
    textoRentabilidade: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00FF7F',
    },
    cardAtivo: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 16,
        padding: 18,
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    linhaSuperior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    ticker: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    valorAtual: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    linhaDetalhes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    textoDetalhe: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    separador: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    linhaInferior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rotulo: {
        fontSize: 11,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: '600',
    },
    valorInvestido: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    rentabilidade: {
        fontSize: 15,
        fontWeight: 'bold',
    }
});