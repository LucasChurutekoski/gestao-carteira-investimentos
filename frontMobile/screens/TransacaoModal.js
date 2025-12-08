import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from 'react'
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

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || data
        setData(currentDate)
        setShowPicker(false)
    }

    const limpaCampos = () => {
        setTicker('')
        setTipoOperacao('')
        setQuantidade('')
        setPrecoUnitario('')
    }

    const buscarAtivo = async () => {
        try {
            const resposta = await axios.get(`http://10.0.2.2:3000/ativo/buscar?ticker=${ticker}`)
            if (resposta.data) {
                setTicker(resposta.data.ticker)
                setPrecoUnitario(resposta.data.precoAtual)
            }
        } catch (error) {
            Alert.alert(
                "erro",
                "ação não encontrada",
                [
                    {
                        text: "tentar novamente"
                    }
                ]
            )
        }

    }

    const toggleDatePicker = () => {
        setShowPicker(true)
    }

    const salvarTransacao = async () => {
        try {
            if (!data || !precoUnitario || !quantidade || !tipoOperacao || !ticker) {
                console.warn("Tentativa de salvar com campos vazios");
                Alert.alert("Erro", "Todos os campos são obrigatórios.");
                return;
            }

            const precoFormatado = parseFloat(precoUnitario)
            const quantidadeFormatada = parseFloat(quantidade.replace(',', '.'))
            const tipoFormatado = tipoOperacao.toLowerCase()
            const dataFormatada = data.toISOString().split('T')[0];

            const dadosTransacao = {
                ticker: ticker,
                precoUnitario: precoFormatado,
                dataTransacao: dataFormatada,
                tipoTransacao: tipoFormatado,
                quantidade: quantidadeFormatada
            }

            const response = await axios.post('http://10.0.2.2:3000/transacao', dadosTransacao)
            Alert.alert(
                "Transação registrada com sucesso",
                "Deseja fazer outra transação?",
                [
                    {
                        text: "Sim",
                        onPress: limpaCampos
                    },
                    {
                        text: "Não"

                    }
                ]
            )

        } catch (error) {
            console.log(error);
            
    let mensagemErro = "Ocorreu um erro inesperado.";

    // Verifica se a resposta veio do backend
    if (error.response && error.response.data) {
        const { message } = error.response.data;

        if (Array.isArray(message)) {
            // Junta todas as mensagens do array em uma única string, separada por quebra de linha
            mensagemErro = message.join('\n'); 
        } else if (typeof message === 'string') {
            mensagemErro = message;
        }
    }

    // Agora 'mensagemErro' é garantidamente uma String
    Alert.alert("Erro ao salvar", mensagemErro);
    }
}

    return (
        <View style={styles.container}> 
                
                <Text style={styles.headerTitle}>Nova Transação</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ticker do Ativo</Text>
                    <View style={styles.rowSearch}> 
                        <TextInput 
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Ex: ITUB4" 
                            onChangeText={setTicker} 
                            value={ticker} 
                        />
                        <TouchableOpacity 
                        style={styles.searchButton} 
                        onPress={buscarAtivo}>
                            <Text style={styles.searchButtonText}>Buscar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Preço Unitário</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="0,00" 
                            keyboardType="numeric"
                            onChangeText={setPrecoUnitario} 
                            value={precoUnitario} 
                        />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Quantidade</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="0" 
                            keyboardType="numeric"
                            onChangeText={setQuantidade} 
                            value={String(quantidade)} 
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo da Transação</Text>
                    <View style={styles.input}> 
                        <Picker
                            selectedValue={tipoOperacao}
                            onValueChange={(itemValue) => setTipoOperacao(itemValue)}
                            style={{ width: '100%', height: 50 }}
                        >
                            <Picker.Item label="Compra" value="compra" />
                            <Picker.Item label="Venda" value="venda" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Data da Transação</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={toggleDatePicker}>
                        <Text style={styles.dateText}>{data.toLocaleDateString('pt-br')}</Text>
                        <Text style={styles.changeDateText}>Alterar</Text>
                    </TouchableOpacity>
                </View>

                {showPicker && (
                    <DateTimePicker
                        testId="dateTimePicker"
                        value={data}
                        mode={'date'}
                        is24Hour={true}
                        display='default'
                        onChange={onChangeDate}
                    />
                )}
                <TouchableOpacity style={styles.saveButton} onPress={salvarTransacao}>
                    <Text style={styles.saveButtonText}>Salvar transação</Text>
                </TouchableOpacity>

        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 10, 
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2, 
    },
    rowSearch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        backgroundColor: '#333',
        height: 50,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginLeft: 10,
    },
    searchButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateButton: {
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    changeDateText: {
        color: '#A020F0',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#A020F0',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});