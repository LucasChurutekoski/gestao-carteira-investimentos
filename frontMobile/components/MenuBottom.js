import { Text, TouchableOpacity, View } from "react-native";

export default function MenuBottom({ navigation }) {

    function irParaTelaHome() {
        navigation.navigate("Home")
    }

    function irParaMinhaConta(){
        navigation.navigate('MinhaConta')
    }

    return (
        <View>
            <TouchableOpacity
                onPress={irParaTelaHome}
            >
                <Text>navegar para Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={irParaMinhaConta}
            >
                <Text>navegar para Minha Conta</Text>
            </TouchableOpacity>
        </View>
    )
}