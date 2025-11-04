import { StyleSheet, Text, View } from "react-native";

export default function Header(){
    return(
        <View styles={styles.container}>
            <Text>TESTE DO HEADER</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1
    }
})