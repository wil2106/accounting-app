import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Avatar, Input, ListItem } from "@rneui/base";
import { useEffect, useRef } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  View
} from "react-native";
import ListFooter from "../components/ListFooter";
import { ROUTES } from "../helpers/constants";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchFirstClients,
  fetchNextClients,
  selectPortfolioClients,
  selectPortfolioReachedEnd,
  selectPortfolioStatus,
} from "../redux/slices/portfolioSlice";
import { Client, HomeStackParamList } from "../types";

type Props = NativeStackScreenProps<HomeStackParamList, "PORTFOLIO">;

export default function PortfolioScreen({ navigation }: Props) {
  let searchDebounceTimeout = useRef<NodeJS.Timeout>().current;

  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectPortfolioClients);
  const status = useAppSelector(selectPortfolioStatus);
  const reachedEnd = useAppSelector(selectPortfolioReachedEnd);

  const onInitFetchClients = () => {
    dispatch(fetchFirstClients({}));
  };

  useEffect(() => {
    onInitFetchClients();
  }, []);

  const onChangeSearch = (search: string) => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      dispatch(fetchFirstClients({ search }));
    }, 500);
  };

  const onLoadMore = () => {
    dispatch(fetchNextClients());
  };

  const renderItem = ({ item }: { item: Client }) => (
    <ListItem
      bottomDivider
      onPress={() =>
        navigation.navigate(ROUTES.CLIENT as any, { client: item })
      }
    >
      <Avatar source={{ uri: item.pictureUrl }} />
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, paddingHorizontal: 15, backgroundColor: "white" }}
      >
        <Input
          placeholder="Search by name"
          autoCorrect={false}
          leftIcon={{ type: "feather", name: "search" }}
          onChangeText={onChangeSearch}
        />
        <FlatList
          style={{ flex: 1 }}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          data={clients}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              onRefresh={onInitFetchClients}
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
    </SafeAreaView>
  );
}
