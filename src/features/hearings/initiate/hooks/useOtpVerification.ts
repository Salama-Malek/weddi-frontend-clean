import { useState, useCallback, useEffect } from "react";
import {
  useReSendOtpMutation,
  useSendOtpMutation,
} from "@/features/hearings/initiate/api/create-case/plaintiffDetailsApis";
import { useTranslation } from "react-i18next";

interface UseOtpVerificationProps {
  phoneCode?: { value: string };
  phoneNumber?: string;
  plaintiffId: string;
  plaintiffName: string;
  setValue: (name: string, value: any, options?: object) => void;
}

export const useOtpVerification = ({
  phoneCode,
  phoneNumber,
  plaintiffId,
  plaintiffName,
  setValue,
}: UseOtpVerificationProps) => {
  const [sendOtp, { data: sendOtpData, isLoading }] = useSendOtpMutation();
  const [ResendOtp] = useReSendOtpMutation();
  const [lastSentOtp, setLastSentOtp] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isNotVerified, setIsNotVerified] = useState<boolean>(false);
  const [isSended, setIsEnded] = useState<boolean>(false);
  const [error, setError] = useState<{
    isError: boolean;
    message: string;
  }>({
    isError: false,
    message: "",
  });

  const { i18n } = useTranslation();
  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtpHandler = useCallback(async () => {
    const newOtp = generateRandomOtp();
    setLastSentOtp(newOtp);
    setIsVerified(false);
    setValue("isVerified", false);

    const payload = {
      Language: i18n.language.toUpperCase(),
      PlaintiffId: plaintiffId,
      PlaintiffName: plaintiffName,
      SourceSystem: "E-Services",
      GlobalNumberOtp: newOtp,
      CountryCode: phoneCode,
      GlobalPhoneNumber: phoneNumber,
    };
    try {
      await sendOtp(payload).unwrap();
    } catch (error) {}
  }, [phoneCode, phoneNumber, plaintiffId, plaintiffName, sendOtp]);

  const resendOtpHandler = async (phoneCodenew: any, phoneNumbernew: any) => {
    const payload = {
      Language: i18n.language.toUpperCase(),
      PlaintiffId: plaintiffId,
      PlaintiffName: plaintiffName,
      SourceSystem: "E-Services",
      GlobalNumberOtp: lastSentOtp,
      CountryCode: phoneCodenew,
      GlobalPhoneNumber: phoneNumbernew,
    };
    try {
      await ResendOtp(payload).unwrap();
    } catch (error) {}
  };

  useEffect(() => {
    if (
      !isLoading &&
      sendOtpData &&
      Array.isArray(sendOtpData.ErrorCodeList) &&
      sendOtpData.ErrorCodeList.length > 0
    ) {
      const firstError = sendOtpData.ErrorCodeList[0];
      setError({
        isError: true,
        message: firstError.ErrorDesc || "حدث خطأ أثناء إرسال رمز التحقق.",
      });
      return;
    } else {
      setError({
        isError: false,
        message: "",
      });
    }

    if (!isLoading && sendOtpData) {
      sendOtpData.SuccessCode &&
        sendOtpData.SuccessCode === "200" &&
        setIsEnded(true);
    } else {
      setIsEnded(false);
    }
  }, [isLoading, sendOtpData]);

  const verifyOtp = useCallback(
    (enteredOtp: string) => {
      const isMatch = enteredOtp === lastSentOtp;
      setIsVerified(isMatch);
      setValue("isVerified", isMatch);
      setIsNotVerified(!isMatch);

      if (isMatch) {
        setValue("phoneCode", phoneCode);
        setValue("interPhoneNumber", phoneNumber);
      }
    },
    [lastSentOtp, setValue],
  );

  const resetOtpVerification = useCallback(() => {
    setLastSentOtp("");
    setIsVerified(false);
    setIsNotVerified(false);
    setIsEnded(false);
    setError({
      isError: false,
      message: "",
    });
    setValue("isVerified", false);
    setValue("otp", "");
    setValue("phoneCode", "");
    setValue("interPhoneNumber", "");
  }, [setValue]);

  return {
    sendOtpHandler,
    resendOtpHandler,
    verifyOtp,
    isVerified,
    isNotVerified,
    setIsNotVerified,
    lastSentOtp,
    isOtpSendedLoading: isLoading,
    isOtpSende: isSended,
    OtpError: error,
    resetOtpVerification,
  };
};
