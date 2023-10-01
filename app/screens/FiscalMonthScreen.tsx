import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BankOperation, HomeStackParamList } from "../types";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  deleteBankOperation,
  fetchFirstBankOperations,
  fetchNextBankOperations,
  selectFiscalMonthBankOperations,
  selectFiscalMonthReachedEnd,
  selectFiscalMonthStatus,
} from "../redux/slices/fiscalMonthSlice";
import { useEffect, useRef, useState } from "react";
import { Button, Card, FAB, Icon, ListItem } from "@rneui/base";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import ListFooter from "../components/ListFooter";
import { Input } from "@rneui/themed";
import utils from "../helpers/utils";
import { clientSliceActions } from "../redux/slices/clientSlice";
import { RootState } from "../redux/store";
import EditBankOperationModal from "../components/EditBankOperationModal";

type Props = NativeStackScreenProps<HomeStackParamList, "FISCAL_MONTH">;
export default function FiscalMonthScreen({ route, navigation }: Props) {
  let searchDebounceTimeout = useRef<NodeJS.Timeout>().current;

  const dispatch = useAppDispatch();
  const fiscalMonth = useAppSelector((state: RootState) =>
    state.client.fiscalMonths.find(
      (fm) => fm.id === route.params.fiscalMonth?.id
    )
  );
  const bankOperations = useAppSelector(selectFiscalMonthBankOperations);
  const status = useAppSelector(selectFiscalMonthStatus);
  const reachedEnd = useAppSelector(selectFiscalMonthReachedEnd);

  const [editBankOperationDialogStatus, setEditBankOperationDialogStatus] =
    useState<{
      visible: boolean;
      bankOperation: BankOperation | null;
    }>({
      visible: false,
      bankOperation: null,
    });

  const onInitFetchBankOperations = () => {
    if (!fiscalMonth?.id) {
      return;
    }
    dispatch(fetchFirstBankOperations({ fiscalMonthId: fiscalMonth.id }));
  };

  useEffect(() => {
    onInitFetchBankOperations();
  }, []);

  const onChangeSearch = (search: string) => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      if (!fiscalMonth?.id) {
        return;
      }
      dispatch(
        fetchFirstBankOperations({
          fiscalMonthId: fiscalMonth.id,
          search,
        })
      );
    }, 500);
  };

  const onLoadMore = () => {
    if (!fiscalMonth?.id) {
      return;
    }
    dispatch(fetchNextBankOperations({ fiscalMonthId: fiscalMonth.id }));
  };

  const onDelete = async (bankOperationId: number, amount: number) => {
    if (!fiscalMonth?.id) {
      return;
    }
    try {
      await dispatch(deleteBankOperation({ bankOperationId })).unwrap();
      dispatch(
        clientSliceActions.substractFiscalMonthBalance({
          fiscalMonthId: fiscalMonth.id,
          amount,
        })
      );
    } catch (err) {
      alert("Something went wrong, Try again later.");
    }
  };

  const renderItem = ({ item }: { item: BankOperation }) => {
    return (
      <ListItem.Swipeable
        onPress={() => {
          setEditBankOperationDialogStatus({
            visible: true,
            bankOperation: item,
          });
        }}
        leftContent={(reset) => (
          <Button
            title="Edit"
            onPress={() => {
              reset();
              setEditBankOperationDialogStatus({
                visible: true,
                bankOperation: item,
              });
            }}
            icon={{ name: "edit-2", type: "feather", color: "white" }}
            buttonStyle={{ minHeight: "100%" }}
          />
        )}
        rightContent={(reset) => (
          <Button
            title="Delete"
            onPress={() => {
              reset();
              onDelete(item.id, item.amount);
            }}
            icon={{ name: "trash-2", type: "feather", color: "white" }}
            buttonStyle={{ minHeight: "100%", backgroundColor: "red" }}
          />
        )}
        bottomDivider
      >
        <Text style={{ color: "grey" }}>#{item.id}</Text>
        <ListItem.Content>
          <ListItem.Title>
            <Text>{item.wording}</Text>
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Content right>
          <Text style={{ fontWeight: "bold" }}>
            {utils.formatAmount(item.amount)}
          </Text>
        </ListItem.Content>
      </ListItem.Swipeable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, paddingHorizontal: 15, backgroundColor: "white" }}
      >
        <Input
          placeholder="Search by #id or description"
          autoCorrect={false}
          leftIcon={{ type: "feather", name: "search" }}
          onChangeText={onChangeSearch}
        />
        <FlatList
          style={{ flex: 1 }}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          data={bankOperations}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              onRefresh={onInitFetchBankOperations}
              refreshing={status === "init-loading"}
            />
          }
          ListFooterComponent={() => (
            <ListFooter
              status={status}
              reachedEnd={reachedEnd}
              onLoadMore={onLoadMore}
            />
          )}
        />
        <FAB
          placement="right"
          visible
          icon={{ name: "add", color: "white" }}
          color="dodgerblue"
          onPress={() => {
            setEditBankOperationDialogStatus({
              visible: true,
              bankOperation: null,
            });
          }}
        />
      </View>
      <View
        style={{
          borderTopColor: "lightgrey",
          borderTopWidth: 1,
          paddingHorizontal: 15,
          paddingVertical: 15,
          backgroundColor: "white",
          justifyContent: "space-evenly",
          flexDirection: "row",
        }}
      >
        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
          <Icon name="bank-outline" type="material-community" />
          <Text>{utils.formatAmount(fiscalMonth?.balance)}</Text>
        </View>
        {fiscalMonth?.balance !== undefined &&
          fiscalMonth?.controlBalance !== undefined &&
          fiscalMonth.controlBalance !== null && (
            <View
              style={{ flexDirection: "row", gap: 3, alignItems: "center" }}
            >
              <Icon
                name="arrow-switch"
                type="octicon"
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  color:
                    fiscalMonth.balance === fiscalMonth.controlBalance
                      ? "limegreen"
                      : "red",
                }}
              >
                {utils.formatAmount(
                  fiscalMonth.balance - fiscalMonth.controlBalance,
                  true
                )}
              </Text>
              {fiscalMonth.balance === fiscalMonth.controlBalance ? (
                <Icon name="check" type="feather" color="limegreen" size={16} />
              ) : (
                <Icon
                  name="alert-triangle"
                  type="feather"
                  color="red"
                  size={16}
                />
              )}
            </View>
          )}
        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
          <Icon
            name="file-text"
            type="feather"
            color={fiscalMonth?.controlBalance ? "black" : "lightgrey"}
          />
          <Text
            style={{
              color: fiscalMonth?.controlBalance ? "black" : "lightgrey",
            }}
          >
            {utils.formatAmount(fiscalMonth?.controlBalance)}
          </Text>
        </View>
      </View>
      {
        fiscalMonth?.id !== undefined && (
          <EditBankOperationModal
          fiscalMonthId={fiscalMonth.id}
          status={editBankOperationDialogStatus}
          onClose={() => {
            setEditBankOperationDialogStatus({
              visible: false,
              bankOperation: null,
            });
          }}
        />
        )
      }
    </SafeAreaView>
  );
}
