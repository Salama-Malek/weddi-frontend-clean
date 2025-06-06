import { useEffect } from "react";
import { useNavigation, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/redux/slices/loadingSlice";

export const useNavigationLoading = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigation.state === "loading") {
      dispatch(startLoading());
    } else {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        dispatch(stopLoading());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, dispatch]);

  // Reset loading state when location changes
  useEffect(() => {
    dispatch(stopLoading());
  }, [location.pathname, dispatch]);
};