import { useEffect } from "react";
import { useNavigation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/redux/slices/loadingSlice";

export const useNavigationLoading = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigation.state === "loading") {
      dispatch(startLoading());
    } else {
      dispatch(stopLoading());
    }
  }, [navigation.state, dispatch]);
};