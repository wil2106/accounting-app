import { Button } from "@rneui/base";
import { ActivityIndicator, Text, View } from "react-native";

const ListFooter = ({
  status,
  reachedEnd,
  onLoadMore,
}: {
  status: string;
  reachedEnd: boolean;
  onLoadMore: () => void;
}) => {
  return (
    <View style={{ marginVertical: 15 }}>
      {reachedEnd ? (
        <Text
          style={{
            alignSelf: "center",
            color: "lightgray",
          }}
        >
          No more results
        </Text>
      ) : status === "next-loading" ? (
        <ActivityIndicator size="small" />
      ) : status === "failed" ? (
        <Text
          style={{
            alignSelf: "center",
            color: "lightgray",
          }}
        >
          Something went wrong, try again later.
        </Text>
      ) : status !== "init-loading" ? (
        <Button title="Load more" type="clear" onPress={onLoadMore} />
      ) : (
        <></>
      )}
    </View>
  );
};

export default ListFooter;