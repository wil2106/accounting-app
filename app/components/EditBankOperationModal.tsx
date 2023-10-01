import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { BankOperation } from "../types";
import { Button, ButtonGroup, Card, Input } from "@rneui/base";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  createBankOperation,
  selectFiscalMonthBankOperationLoading,
  updateBankOperation,
} from "../redux/slices/fiscalMonthSlice";
import { clientSliceActions } from "../redux/slices/clientSlice";

const EditBankOperationModal = ({
  fiscalMonthId,
  status,
  onClose,
}: {
  fiscalMonthId: number;
  status: { visible: boolean; bankOperation: BankOperation | null };
  onClose: () => void;
}) => {
  const [state, setState] = useState<{
    selectedTypeIndex: number;
    amount: string;
    description: string;
  }>({
    selectedTypeIndex: 0,
    amount: "",
    description: "",
  });

  useEffect(() => {
    if (status.bankOperation !== null) {
      setState({
        selectedTypeIndex: status.bankOperation.amount >= 0 ? 0 : 1,
        amount: Math.abs(status.bankOperation.amount / 100).toString(),
        description: status.bankOperation.wording,
      });
    } else {
      setState({
        selectedTypeIndex: 0,
        amount: "",
        description: "",
      });
    }
  }, [status]);

  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectFiscalMonthBankOperationLoading);

  const onSubmit = async () => {
    const formattedAmount = state.amount.trim();
    const formattedDescription = state.description.trim();
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
    // calculate real amount by applying sign and converting to cents (smallest unit posssible)
    const finalAmount = sign * intAmount * 100;
    if (status.bankOperation) {
      // update
      try {
        await dispatch(
          updateBankOperation({
            bankOperationId: status.bankOperation.id,
            amount: finalAmount,
            description: formattedDescription,
          })
        ).unwrap();
        const previousBankOperation = status.bankOperation.amount * -1;
        if (sign > 0){
          dispatch(clientSliceActions.AddFiscalMonthBalance({fiscalMonthId, amount: intAmount * 100}));
        } else {
          dispatch(clientSliceActions.substractFiscalMonthBalance({fiscalMonthId, amount: intAmount * 100}));
        }
        onClose();
      } catch (err) {
        alert("Something went wrong, try again later.");
      }
    } else {
      // create
      try {
        await dispatch(
          createBankOperation({
            fiscalMonthId,
            amount: finalAmount,
            description: formattedDescription,
          })
        ).unwrap();
        if (sign > 0){
          dispatch(clientSliceActions.AddFiscalMonthBalance({fiscalMonthId, amount: intAmount * 100}));
        } else {
          dispatch(clientSliceActions.substractFiscalMonthBalance({fiscalMonthId, amount: intAmount * 100}));
        }
        onClose();
      } catch (err) {
        alert("Something went wrong, try again later.");
      }
    }
  };
  return (
    <Modal animationType="fade" transparent={true} visible={status.visible}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Card containerStyle={{ minWidth: "90%" }}>
            <Card.Title>
              {status.bankOperation
                ? "Edit bank operation"
                : "Create bank operation"}
            </Card.Title>
            <Card.Divider />
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
            <Input
              placeholder="Amount in €"
              keyboardType="number-pad"
              onChangeText={(text) =>
                setState((prevState) => ({ ...prevState, amount: text }))
              }
              disabled={loading}
              value={state.amount}
            />
            <Input
              placeholder="Description"
              maxLength={50}
              onChangeText={(text) =>
                setState((prevState) => ({ ...prevState, description: text }))
              }
              disabled={loading}
              value={state.description}
            />
            <View
              style={{
                flexDirection: "row",
                gap: 15,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button
                title="Cancel"
                type="outline"
                onPress={onClose}
                disabled={loading}
              />
              <Button
                title={status.bankOperation ? "Save" : "Create"}
                onPress={onSubmit}
                loading={loading}
              />
            </View>
          </Card>
        </KeyboardAvoidingView>
      </ScrollView>
    </Modal>
  );
};

export default EditBankOperationModal;
