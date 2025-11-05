import { Text, TextInput, View } from "react-native";
import { useState } from 'react'
import { Picker } from '@react-native-picker/picker'

export default function TransacaoModal({navigation}) {
    const[ticker, setTicker] = useState('')
    const[tipoOperacao, setTipoOperacao] = useState('')
    const[quantidade, setQuantidade] = useState('')
    const[precoUnitario, setPrecoUnitario] = useState('')
    const[dataCompra, setDataCompra] = useState('')


    return(
        <View>
            <Text>Informe o ticker do ativo Ou o nome da criptomoeda</Text>
            <TextInput placeholder="Itub4"/>
            <Text>Informe o preço unitário</Text>
            <TextInput placeholder="29.80"/>
            <Text>Informe a quantidade</Text>
            <TextInput placeholder="20"/>
            <Text>Tipo da transação</Text>
            <Picker>
                
            </Picker>
        </View>
    )
}