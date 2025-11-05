import { Button, Text, TextInput, View } from "react-native";
import { useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TransacaoModal({ navigation }) {
    const [ticker, setTicker] = useState('')
    const [tipoOperacao, setTipoOperacao] = useState('')
    const [quantidade, setQuantidade] = useState('')
    const [precoUnitario, setPrecoUnitario] = useState('')
    const [dataTransacao, setDataTransacao] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const[data, setData] = useState(new Date())

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || data
        setData(currentDate)
        setShowPicker(false)
    }

    const toggleDatePicker = () => {
        setShowPicker(true)
    }

    return (
        <View>
            <Text>Informe o ticker do ativo Ou o nome da criptomoeda</Text>
            <TextInput placeholder="Itub4" />
            <Text>Informe o preço unitário</Text>
            <TextInput placeholder="29.80" />
            <Text>Informe a quantidade</Text>
            <TextInput placeholder="20" />
            <Text>Tipo da transação</Text>
            <Picker
                selectedValue={tipoOperacao}
                onChangeValue={(itemValue, itemIndex) => {
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
        </View>
    )
}