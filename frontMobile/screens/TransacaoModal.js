import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";

export default function TransacaoModal({ navigation }) {
    const [ticker, setTicker] = useState('')
    const [tipoOperacao, setTipoOperacao] = useState('compra')
    const [quantidade, setQuantidade] = useState('')
    const [precoUnitario, setPrecoUnitario] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [data, setData] = useState(new Date())
    const [carregando, setCarregando] = useState(false)

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || data
        setData(currentDate)
        setShowPicker(false)
    }

    const limpaCampos = () => {
        setTicker('')
        setTipoOperacao('compra')
        setQuantidade('')
        setPrecoUnitario('')
    }

    const buscarAtivo = async () => {
        if (!ticker) return;
        setCarregando(true);
        try {
            const resposta = await axios.get(`http://10.0.2.2:3000/ativo/buscar?ticker=${ticker}`)
            if (resposta.data) {
                setTicker(resposta.data.ticker)
                setPrecoUnitario(String(resposta.data.precoAtual))
            }
        } catch (error) {
            Alert.alert("Erro", "Ação não encontrada", [{ text: "OK" }])
        } finally {
            setCarregando(false);
        }
    }

    const toggleDatePicker = () => {
        setShowPicker(true)
    }

    const salvarTransacao = async () => {
        try {
            if (!data || !precoUnitario || !quantidade || !tipoOperacao || !ticker) {
                Alert.alert("Erro", "Todos os campos são obrigatórios.");
                return;
            }

            const precoFormatado = parseFloat(precoUnitario.toString().replace(',', '.'))
            const quantidadeFormatada = parseFloat(quantidade.toString().replace(',', '.'))
            const tipoFormatado = tipoOperacao.toLowerCase()
            const dataFormatada = data.toISOString().split('T')[0];

            const dadosTransacao = {
                ticker: ticker,
                precoUnitario: precoFormatado,
                dataTransacao: dataFormatada,
                tipoTransacao: tipoFormatado,
                quantidade: quantidadeFormatada
            }

            await axios.post('http://10.0.2.2:3000/transacao', dadosTransacao)
            Alert.alert(
                "Sucesso",
                "Transação registrada!",
                [
                    { text: "Nova Transação", onPress: limpaCampos },
                    { text: "Sair", onPress: () => navigation.goBack() }
                ]
            )

        } catch (error) {
            let mensagemErro = "Ocorreu um erro inesperado.";
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                mensagemErro = Array.isArray(message) ? message.join('\n') : message;
            }
            Alert.alert("Erro ao salvar", mensagemErro);
        }
    }

    return (
        <View style={estilos.conteinerPrincipal}>
            <ScrollView contentContainerStyle={estilos.scrollConteudo}>
                
                <Text style={estilos.titulo}>Nova Transação</Text>
                <Text style={estilos.rotulo}>Ticker do Ativo</Text>
                <View style={estilos.linhaBusca}>
                    <TextInput 
                        style={estilos.inputBusca}
                        placeholder="Ex: ITUB4" 
                        onChangeText={setTicker} 
                        value={ticker} 
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity 
                        style={estilos.botaoBusca} 
                        onPress={buscarAtivo}
                        disabled={carregando}
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={estilos.textoBotaoBusca}>Buscar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={estilos.linhaDupla}>
                    <View style={estilos.colunaMetade}>
                        <Text style={estilos.rotulo}>Preço Unitário</Text>
                        <TextInput 
                            style={estilos.input} 
                            placeholder="0.00" 
                            keyboardType="numeric"
                            onChangeText={setPrecoUnitario} 
                            value={String(precoUnitario)} 
                        />
                    </View>

                    <View style={estilos.colunaMetade}>
                        <Text style={estilos.rotulo}>Quantidade</Text>
                        <TextInput 
                            style={estilos.input} 
                            placeholder="0" 
                            keyboardType="numeric"
                            onChangeText={setQuantidade} 
                            value={String(quantidade)} 
                        />
                    </View>
                </View>

                <Text style={estilos.rotulo}>Tipo da Transação</Text>
                <View style={estilos.containerPicker}>
                    <Picker
                        selectedValue={tipoOperacao}
                        onValueChange={(itemValue) => setTipoOperacao(itemValue)}
                        style={estilos.picker}
                    >
                        <Picker.Item label="Compra" value="compra" />
                        <Picker.Item label="Venda" value="venda" />
                    </Picker>
                </View>

                <Text style={estilos.rotulo}>Data da Transação</Text>
                <TouchableOpacity style={estilos.botaoData} onPress={toggleDatePicker}>
                    <Text style={estilos.textoData}>{data.toLocaleDateString('pt-br')}</Text>
                    <Text style={estilos.textoAlterarData}>Alterar</Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={data}
                        mode={'date'}
                        is24Hour={true}
                        display='default'
                        onChange={onChangeDate}
                    />
                )}

                <TouchableOpacity style={estilos.botaoSalvar} onPress={salvarTransacao}>
                    <Text style={estilos.textoBotaoSalvar}>Salvar transação</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    )
}

const estilos = StyleSheet.create({
    conteinerPrincipal: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    scrollConteudo: {
        padding: 20,
        paddingBottom: 40,
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
        marginTop: 10,
        textAlign: 'center'
    },
    rotulo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
        color: '#333',
    },
    linhaBusca: {
        flexDirection: 'row',
        marginBottom: 20,
        height: 50,
    },
    inputBusca: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRightWidth: 0,
    },
    botaoBusca: {
        backgroundColor: '#333',
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    textoBotaoBusca: {
        color: '#FFF',
        fontWeight: 'bold',
    },

    linhaDupla: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    colunaMetade: {
        width: '48%',
    },
    containerPicker: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        color: '#333',
    },
    botaoData: {
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 30,
    },
    textoData: {
        fontSize: 16,
        color: '#333',
    },
    textoAlterarData: {
        color: '#A020F0',
        fontWeight: 'bold',
    },
    botaoSalvar: {
        backgroundColor: '#A020F0',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    textoBotaoSalvar: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});