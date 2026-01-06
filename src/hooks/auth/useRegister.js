import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import * as yup from "yup";
import axiosInstance from "../../utils/axiosInstance";

export default function useRegister(t, setStep) {
  const navigate = useNavigate();
  const [code, setCode] = useState(null);
  const [, setCookie] = useCookies(["token"]);

  const schema = yup.object().shape({
    first_name: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.min", { min: 2 }))
      .max(32, t("validation.max", { max: 32 }))
      .matches(
        /^[A-Za-z0-9\u0600-\u06FF\s]+$/,
        t("validation.alphaNumericOnly")
      ),

    last_name: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.min", { min: 2 }))
      .max(32, t("validation.max", { max: 32 }))
      .matches(
        /^[A-Za-z0-9\u0600-\u06FF\s]+$/,
        t("validation.alphaNumericOnly")
      ),

    whatsapp: yup
      .string()
      .required(t("validation.required"))
      .matches(/^\d+$/, t("validation.numbersOnly"))
      .min(6, t("validation.min", { min: 6 })),

    country_id: yup.string().required(t("validation.required")),

    email: yup
      .string()
      .required(t("validation.required"))
      .email(t("validation.email"))
      .max(63, t("validation.max", { max: 63 })),
    address: yup.string().required(t("validation.required")),
    password: yup
      .string()
      .required(t("validation.required"))
      .min(6, t("validation.min", { min: 6 }))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!#%*?&]{8,}$/,
        t("validation.passwordComplexity")
      ),

    password_confirmation: yup
      .string()
      .required(t("validation.required"))
      .oneOf([yup.ref("password"), null], t("validation.passwordMatch")),

    terms: yup
      .boolean()
      .oneOf([true], t("validation.terms"))
      .required(t("validation.required")),
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      whatsapp: "",
      country_id: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms: false,
    },
  });

  const { mutate: submitRegister, isPending: isPendingRegister } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/register", watch());
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        toast.success(t("auth.registerSuccess"));

        setCookie("token", data.data?.auth?.token, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        });

        navigate("/profile");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    },
  });

  const { mutate: submitSendCode, isPending: isPendingSendCode } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post("/auth/sendOtp", {
        email: data.email,
        type: "register",
      });
      return response.data;
    },
    onSuccess: (res) => {
      if (res.code === 200) {
        toast.success(t("auth.codeSent", { email: watch("email") }));
        setStep(2);
      } else {
        toast.error(res.message);
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    },
  });

  const { mutate: checkCode, isPending: isPendingCheckCode } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/checkCode", {
        email: watch("email"),
        code,
      });
      return response.data;
    },
    onSuccess: (res) => {
      if (res.code === 200) {
        const formData = watch();
        submitRegister({
          ...formData,
          code,
        });
      } else {
        toast.error(res.message);
      }
    },
    onError: (error) => {
      toast.error(t("auth.wrongCode"));
      console.log("error in step 2", error);
    },
  });

  return {
    register,
    handleSubmit,
    errors,
    isLoading: isPendingRegister || isPendingSendCode || isPendingCheckCode,
    checkCode,
    watch,
    setCode,
    setValue,
    code,
    submitSendCode,
  };
}
