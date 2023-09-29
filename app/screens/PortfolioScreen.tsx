import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  View,
  VirtualizedList,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectPortfolioClients,
  selectPortfolioStatus,
  selectPortfolioReachedEnd,
  fetchClients,
  portfolioSliceActions,
} from "../redux/slices/portfolioSlice";
import { Avatar, Input, ListItem, Text } from "@rneui/base";
import { Client } from "../types";

export default function PortfolioScreen() {
  let searchThrottleTimeout = useRef<NodeJS.Timeout>().current;
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectPortfolioClients);
  const status = useAppSelector(selectPortfolioStatus);
  const reachedEnd = useAppSelector(selectPortfolioReachedEnd);

  useEffect(() => {
    onInitFetchClients();
  }, []);

  const onInitFetchClients = () => {
    dispatch(fetchClients({ init: true }));
  };

  const onChangeText = (text: string) => {
    dispatch(portfolioSliceActions.setSearch(text));
    clearTimeout(searchThrottleTimeout);
    searchThrottleTimeout = setTimeout(() => {
      dispatch(fetchClients({ init: true }));
    }, 500);
  };

  const renderItem = ({ item }: { item: Client }) => (
    <ListItem bottomDivider>
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
          placeholder="Search"
          autoCorrect={false}
          leftIcon={{ type: "feather", name: "search" }}
          onChangeText={onChangeText}
          style={{ paddingBottom: 0 }}
        />
        <FlatList
          keyExtractor={(item, index) => `${item.id}-${index}`}
          data={clients}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              onRefresh={onInitFetchClients}
              refreshing={status === "init-loading"}
            />
          }
          ListFooterComponent={
            reachedEnd ? (
              <Text
                style={{ alignSelf: "center", marginTop: 15, color: "grey" }}
              >
                Reached end of list
              </Text>
            ) : (
              <></>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
