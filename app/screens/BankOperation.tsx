import DateTimePicker from "@react-native-community/datetimepicker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, ButtonGroup, Input } from "@rneui/base";
import { endOfMonth, format, isValid, parseISO, startOfMonth } from "date-fns";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clientSliceActions } from "../redux/slices/clientSlice";
import { createBankOperation, selectFiscalMonthBankOperationLoading, updateBankOperation } from "../redux/slices/fiscalMonthSlice";
import { HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "BANK_OPERATION">;

const BankOperation = ({ route, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectFiscalMonthBankOperationLoading);

  const [state, setState] = useState<{
    selectedTypeIndex: number;
    amount: string;
    description: string;
    createdAt: Date;
  }>({
    selectedTypeIndex:
      route.params?.bankOperation === undefined ||
      route.params.bankOperation.amount >= 0
        ? 0
        : 1,
    amount:
      route.params?.bankOperation === undefined
        ? ""
        : Math.abs(route.params.bankOperation.amount / 100).toString(),
    description:
      route.params?.bankOperation === undefined
        ? ""
        : route.params.bankOperation.wording,
    createdAt:
      route.params?.bankOperation !== undefined &&
      isValid(parseISO(route.params.bankOperation.createdAt))
        ? parseISO(route.params.bankOperation.createdAt)
        : route.params.fiscalMonth ? startOfMonth(parseISO(route.params.fiscalMonth.date)) : new Date(),
  });

  const onSubmit = async () => {
    if (!route.params.fiscalMonth){
      return;
    }
    const formattedAmount = state.amount.trim();
    const formattedDescription = state.description.trim();
    const formattedCreatedAt = format(state.createdAt, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    if (formattedAmount.length === 0) {
      return alert("Amount can't be empty.");
    }
    const intAmount = parseInt(formattedAmount);
    if (isNaN(intAmount)) {
      return alert("Invalid number.");
    }
    if (intAmount === 0) {
      return alert("Amount can't be equal to 0.");
    }
    const sign = state.selectedTypeIndex === 0 ? 1 : -1;
    // apply sign and convert to cents (smallest money unit)
    const realAmount = sign * intAmount * 100;
    if (route.params.bankOperation){
      try {
        await dispatch(updateBankOperation({
          bankOperationId: route.params.bankOperation.id,
          createdAt: formattedCreatedAt,
          amount: realAmount,
          description: formattedDescription,
        })).unwrap();
        const previousAmount = route.params.bankOperation.amount;
        const updateAmount = -1 * previousAmount + realAmount;
        dispatch(clientSliceActions.addFiscalMonthBalance({
          fiscalMonthId: route.params.fiscalMonth.id,
          amount: updateAmount,
        }));
        navigation.goBack();
      } catch (err) {
        alert("Something went wrong, try gain later.");
      }
    } else {
      try {
        await dispatch(createBankOperation({
          fiscalMonthId: route.params.fiscalMonth.id,
          createdAt: formattedCreatedAt,
          amount: realAmount,
          description: formattedDescription,
        })).unwrap();
        dispatch(clientSliceActions.addFiscalMonthBalance({
          fiscalMonthId: route.params.fiscalMonth.id,
          amount: realAmount,
        }));
        navigation.goBack();
      } catch (err) {
        alert("Something went wrong, try gain later.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 15,
        }}
      >
        <Text style={{ fontWeight: "bold", marginLeft: 8 }}>Type</Text>
        <ButtonGroup
          buttons={["Credit", "Debit"]}
          selectedIndex={state.selectedTypeIndex}
          onPress={(value) => {
            setState((prevState) => ({
              ...prevState,
              selectedTypeIndex: value,
            }));
          }}
          containerStyle={{ marginBottom: 20 }}
          disabled={loading}
        />
        <Text style={{ fontWeight: "bold", marginBottom: 5, marginLeft: 8 }}>Date</Text>
        <View style={{flexDirection: "row", justifyContent: "flex-start",  marginBottom: 15}}>
          {
            route.params?.fiscalMonth && isValid(parseISO(route.params.fiscalMonth.date)) && (
              <DateTimePicker
                disabled={loading}
                value={state.createdAt}
                mode="datetime"
                maximumDate={endOfMonth(parseISO(route.params.fiscalMonth.date))}
                minimumDate={startOfMonth(parseISO(route.params.fiscalMonth.date))}
                onChange={(result) => {
                  if (!result.nativeEvent.timestamp) {
                    return;
                  }
                  setState((prevState) => ({
                    ...prevState,
                    createdAt: new Date(result.nativeEvent.timestamp!),
                  }));
                }}
              />
            )
          }
          </View>
        <Text style={{ fontWeight: "bold", marginLeft: 8 }}>Amount in €</Text>
        <Input
          placeholder="Amount in €"
          keyboardType="number-pad"
          onChangeText={(text) =>
            setState((prevState) => ({ ...prevState, amount: text }))
          }
          disabled={loading}
          value={state.amount}
        />
        <Text style={{ fontWeight: "bold", marginLeft: 8 }}>Description</Text>
        <Input
          placeholder="Description"
          maxLength={50}
          onChangeText={(text) =>
            setState((prevState) => ({ ...prevState, description: text }))
          }
          disabled={loading}
          value={state.description}
        />
      </ScrollView>
      <View
        style={{
          position: "absolute",
          bottom: 15,
          paddingHorizontal: 15,
          left: 0,
          right: 0,
          flexDirection: "row",
          gap: 15,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          title="Cancel"
          type="outline"
          onPress={() => navigation.goBack()}
          disabled={loading}
        />
        <Button
          title={route.params?.bankOperation ? "Save" : "Create"}
          onPress={onSubmit}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default BankOperation;
