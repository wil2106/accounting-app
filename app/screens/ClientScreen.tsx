import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, ListItem } from "@rneui/base";
import { useEffect } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import ListFooter from "../components/ListFooter";
import { ROUTES } from "../helpers/constants";
import utils from "../helpers/utils";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchFirstFiscalMonths,
  fetchNextFiscalMonths,
  selectClientFiscalMonths,
  selectClientReachedEnd,
  selectClientStatus,
} from "../redux/slices/clientSlice";
import { FiscalMonth, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "CLIENT">;

export default function ClientScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const fiscalMonths = useAppSelector(selectClientFiscalMonths);
  const status = useAppSelector(selectClientStatus);
  const reachedEnd = useAppSelector(selectClientReachedEnd);

  const onInitFetchFiscalMonths = () => {
    if (!route.params.client?.id) {
      return;
    }
    dispatch(fetchFirstFiscalMonths({ clientId: route.params.client.id }));
  };

  useEffect(() => {
    onInitFetchFiscalMonths();
  }, []);

  const onLoadMore = () => {
    if (!route.params.client?.id) {
      return;
    }
    dispatch(fetchNextFiscalMonths({ clientId: route.params.client.id }));
  };

  const renderItem = ({ item }: { item: FiscalMonth }) => {
    let icon = <></>;
    if (!item.controlBalance) {
      icon = <Icon name="hourglass" type="antdesign" color="lightgrey" />;
    } else if (item.controlBalance === item.balance) {
      icon = <Icon name="check" type="feather" color="limegreen" />;
    } else {
      icon = <Icon name="alert-triangle" type="feather" color="red" />;
    }
    return (
      <ListItem
        bottomDivider
        onPress={() =>
          navigation.navigate(ROUTES.FISCAL_MONTH as any, { fiscalMonth: item })
        }
      >
        {icon}
        <ListItem.Content>
          <ListItem.Title>
            {utils.getMonthYearStringFromDateString(item.date)}
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    );
  };
  return (
    <View style={{ flex: 1, paddingHorizontal: 15, backgroundColor: "white" }}>
      <FlatList
        style={{ flex: 1 }}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        data={fiscalMonths}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            onRefresh={onInitFetchFiscalMonths}
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
    </View>
  );
}
