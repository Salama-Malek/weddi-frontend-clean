import Button from "@/shared/components/button";
import { SectionLayout } from "@/shared/components/form/form.types";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PHONE_PATTERNS } from "@/config/app.config";
import { useGetCountryCodeLookupDataQuery } from "@/features/hearings/initiate/api/create-case/plaintiffDetailsApis";
import { useOtpVerification } from "@/features/hearings/initiate/hooks/useOtpVerification";
import { TokenClaims } from "@/features/auth/components/AuthProvider";
import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";

export interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

export interface FormData {
  isPhone?: boolean;
  phoneCode?: string;
  interPhoneNumber?: string;
  otp?: string;
}

export interface OTPFormLayoutProps {
  watch?: any;
  setValue?: any;
}

const OTPFormLayout = ({
  watch,
  setValue,
}: OTPFormLayoutProps): SectionLayout[] => {
  const isPhone = watch("isPhone") || false;
  const phoneCode = watch("phoneCode");
  const phoneNumber = watch("interPhoneNumber");

  const [phoneCodeState, setPhoneCodeState] = useState();
  const [phoneNumberState, setPhoneNumberState] = useState();

  const { t, i18n } = useTranslation("hearingtopics");
  const { t: optTraslations } = useTranslation("hearingdetails");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);
  const [showVerifyBtn, setSHowVerifyBtn] = useState<boolean>(false);
  const [getCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");

  const claimantStatus = watch("claimantStatus");
  const [userId, setUserId] = useState<string>();

  const { data: countryData } = useGetCountryCodeLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
  });

  useEffect(() => {
    setUserId(userClaims.UserID);
    resetOtpVerification();
  }, [claimantStatus]);

  const {
    sendOtpHandler,
    verifyOtp,
    isVerified,
    isNotVerified,

    isOtpSendedLoading,
    isOtpSende,
    resetOtpVerification,
    resendOtpHandler,
  } = useOtpVerification({
    phoneCode: phoneCode?.value || "",
    phoneNumber: phoneNumber || "",
    plaintiffId: userId || "",
    plaintiffName: userClaims?.UserName || "",
    setValue: setValue as any,
  });

  useEffect(() => {
    phoneCode && phoneCode != undefined && setPhoneCodeState(phoneCode.value);
    phoneNumber && phoneNumber != undefined && setPhoneNumberState(phoneNumber);
  }, [phoneCode, phoneNumber]);

  const CountryCodeOptions = useMemo(
    () =>
      (countryData &&
        countryData?.DataElements?.map((item: DataElement) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      [],
    [countryData],
  );

  const getPhoneConfig = (code: string) =>
    PHONE_PATTERNS[code] || PHONE_PATTERNS.DEFAULT;

  const isPhoneValid = (() => {
    if (!phoneCode || !phoneNumber) return false;

    if (phoneCode.value) {
      const pattern = getPhoneConfig(phoneCode.value).pattern;
      return pattern.test(phoneNumber);
    }

    const generalPattern = /^[0-9]{5,15}$/;
    return generalPattern.test(phoneNumber);
  })();

  const isSendOtpDisabled = !phoneCode || !phoneNumber || !isPhoneValid;

  const progress = ((60 - timeLeft) / 60) * 100;

  useEffect(() => {
    if (!otpSent || isVerified || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [otpSent, timeLeft, isVerified]);

  useEffect(() => {
    if (timeLeft === 0 && !isVerified) setShowResend(true);
  }, [timeLeft, isVerified]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    setValue("otp", newOtp.join(""));

    const isOtpCompleteAndValid =
      newOtp.length === 6 && newOtp.every((val) => /^\d$/.test(val));

    if (isOtpCompleteAndValid) {
      setSHowVerifyBtn(true);
    } else {
      setSHowVerifyBtn(false);
    }
  };

  const handleSendOtp = () => {
    if (isSendOtpDisabled || !sendOtpHandler) return;
    sendOtpHandler();
    resetAll();
  };
  const resetAll = () => {
    setOtpSent(true);
    setTimeLeft(60);
    setShowResend(false);
    setOtp(Array(6).fill(""));
  };

  const handleResendOtp = () => {
    setTimeLeft(60);
    setOtp(Array(6).fill(""));
    setShowResend(false);
    resendOtpHandler(phoneCodeState, phoneNumberState);
  };

  const handleCerifyOtp = () => {
    verifyOtp(otp.join(""));
  };

  return [
    {
      gridCols: 3,
      className: "international-phone-number-section",
      children: [
        {
          type: "checkbox",
          name: "isPhone",
          label: optTraslations("OTP.addInternationalNumber"),
          checked: isPhone ? isPhone : false,
          onChange: (checked: boolean) => {
            setValue("isPhone", checked);
            if (!checked) {
              setOtpSent(false);
              setOtp(Array(6).fill(""));
              setTimeLeft(60);
              setShowResend(false);
              resetOtpVerification();
            }
          },
        },
      ],
    },

    {
      condition: isPhone && !isOtpSende,
      children: [
        {
          type: "autocomplete",
          label: optTraslations("OTP.countryCode"),
          name: "phoneCode",
          options: CountryCodeOptions,
          value: phoneCode,
          onChange: (value: string) => setValue("phoneCode", value),
          ...(isPhone
            ? {
                validation: {
                  required: (value: any) => {
                    const hasInternationalNumber = watch("interPhoneNumber");
                    return hasInternationalNumber && (!value || !value.value)
                      ? optTraslations("OTP.codeValidation")
                      : true;
                  },
                  validate: (value: any) => {
                    const hasInternationalNumber = watch("interPhoneNumber");

                    if (hasInternationalNumber && (!value || !value.value)) {
                      return t("countryCodeRequired");
                    }
                    return true;
                  },
                },
              }
            : {}),
        },
        {
          type: "input",
          name: "interPhoneNumber",
          label: optTraslations("OTP.phoneNumber"),
          inputType: "tel",
          maxLength: 15,
          value: phoneNumber ?? "",
          onChange: (v: string) => setValue("interPhoneNumber", v),
          placeholder: optTraslations("OTP.international_phone"),
          ...(isPhone
            ? {
                validation: {
                  required: t("interPhoneNumberValidation"),
                  validate: (value: string) => {
                    if (!value) return t("interPhoneNumberValidation");

                    if (phoneCode && phoneCode.value) {
                      const pattern = getPhoneConfig(phoneCode.value).pattern;
                      return pattern.test(value) || t("phoneNumberValidation");
                    }

                    const generalPattern = /^[0-9]{5,15}$/;
                    return (
                      generalPattern.test(value) ||
                      t("internationalNumberFormat")
                    );
                  },
                },
              }
            : {}),
        },
        {
          type: "custom",
          component: (
            <Button
              size="sm"
              className="h-8 mt-[35px]"
              type="button"
              onClick={handleSendOtp}
              disabled={isSendOtpDisabled}
              variant={isSendOtpDisabled ? "disabled" : "primary"}
              typeVariant={isSendOtpDisabled ? "freeze" : "primary"}
              isLoading={isOtpSendedLoading}
            >
              {optTraslations("OTP.sendOtp")}
            </Button>
          ),
        },
      ],
      className: "",
      gridCols: 3,
    },

    {
      title: optTraslations("OTP.enterOtp"),
      condition: !isOtpSendedLoading && isOtpSende && otpSent && !isVerified,
      children: [
        {
          type: "custom",
          component: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {optTraslations("OTP.otp_dec")}
              </p>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`w-12 h-12 border rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isNotVerified && "border-2 border-red-300 shadow-lg"
                    }`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e, otp)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <div className="flex justify-end items-center gap-3">
                {showResend ? (
                  <Button
                    type={"button"}
                    variant="secondary"
                    typeVariant="outline"
                    onClick={handleResendOtp}
                    size="xs"
                  >
                    {optTraslations("OTP.sendOtp")}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                      <div
                        className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
                        style={{
                          transform: `rotate(${progress * 3.6}deg)`,
                          clipPath:
                            progress >= 50 ? "inset(0)" : "inset(0 0 0 50%)",
                        }}
                      ></div>
                      {progress < 50 && (
                        <div
                          className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
                          style={{
                            transform: `rotate(180deg)`,
                            clipPath: `inset(0 ${100 - progress * 2}% 0 0)`,
                          }}
                        ></div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {optTraslations("OTP.Resend_otp")} {timeLeft}{" "}
                      {optTraslations("OTP.sec")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ),
        },
      ],
      className: undefined,
      gridCols: 0,
    },

    {
      condition: isOtpSende && otpSent && !isVerified,
      children: [
        {
          type: "custom",
          component: (
            <Button
              size="sm"
              type="button"
              onClick={handleCerifyOtp}
              className="w-full"
              disabled={!showVerifyBtn}
            >
              {optTraslations("OTP.verifyOtp")}
            </Button>
          ),
        },
      ],
      className: undefined,
      gridCols: 0,
    },

    {
      condition: isVerified,
      children: [
        {
          type: "custom",
          component: (
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              <p className="font-medium">{optTraslations("OTP.sussess_otp")}</p>
            </div>
          ),
        },
      ],
      className: undefined,
      gridCols: 0,
    },
  ].filter(Boolean) as SectionLayout[];
};

const handleKeyDown = (
  index: number,
  e: KeyboardEvent<HTMLInputElement>,
  otp: string[],
): void => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    const prev = document.getElementById(
      `otp-input-${index - 1}`,
    ) as HTMLInputElement;
    prev?.focus();
  }
};

export default OTPFormLayout;
