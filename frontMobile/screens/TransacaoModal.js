import { Alert, Button, Text, TextInput, View } from "react-native";
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
            console.log("Executou o salvamento")
            const precoFormatado = parseFloat(precoUnitario.replace(',', '.'))
            const quantidadeFormatada = parseFloat(quantidade.replace(',', '.'))
            const tipoFormatado = tipoOperacao.toLowerCase()
            const dataFormatada = data.toISOString().split('T')[0];

            const dadosTransacao = {
                ticker: ticker,
                precoUnitario: precoFormatado,
                dataCompra: dataFormatada,
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
            const mensagem = error.response.data.message
            console.log(mensagem)
            Alert.alert(
                "Erro",
                mensagem,
                [
                    {
                        text: "tentar novamente"
                    }
                ]
            )
        }
    }

    return (
        <View>
            <Text>Informe o ticker do ativo Ou o nome da criptomoeda</Text>
            <TextInput placeholder="Itub4" onChangeText={setTicker} value={ticker} />
            <Button
                title="Buscar Ativo"
                onPress={buscarAtivo}
            />
            <Text>Informe o preço unitário</Text>
            <TextInput placeholder="29.80" onChangeText={setPrecoUnitario} value={precoUnitario} />
            <Text>Informe a quantidade</Text>
            <TextInput placeholder="20" onChangeText={setQuantidade} value={quantidade} />
            <Text>Tipo da transação</Text>
            <Picker
                selectedValue={tipoOperacao}
                onValueChange={(itemValue, itemIndex) => {
                    setTipoOperacao(itemValue)
                }}
            >
                <Picker.Item label="Compra" value="compra" />
                <Picker.Item label="Venda" value="venda" />
            </Picker>
            <Text>{data.toLocaleDateString('pt-br')}</Text>
            <Button
                title="Alterar a data"
                onPress={toggleDatePicker}
            />
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
            <Button
                title="Salvar transação"
                onPress={salvarTransacao}
            />

        </View>
    )
}