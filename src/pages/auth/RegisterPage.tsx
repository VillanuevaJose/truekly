import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { StepProgress } from "../../components/auth/StepProgress";
import { SelfieStep } from "../../components/auth/SelfieStep";
import { DniPhotoStep } from "../../components/auth/DniPhotoStep";
import { OtpStep } from "../../components/auth/OtpStep";
import { consultarDni } from "../../services/reniec";
import { parseReniecNombres } from "../../lib/nameParser";
import {
  enviarCodigoVerificacion,
  generarCodigo6Digitos,
} from "../../services/emailService";
import {
  supabase,
  base64ToBlob,
  checkDniRegistrado,
  checkUsernameDisponible,
} from "../../lib/supabaseClient";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Mail,
  Lock,
  User,
  IdCard,
} from "lucide-react";

function sendBreadcrumb(step: string, data?: any) {
  const payload = { step, data, time: new Date().toISOString() };
  try {
    const list = JSON.parse(localStorage.getItem("truekly_breadcrumbs") || "[]");
    list.push(payload);
    localStorage.setItem("truekly_breadcrumbs", JSON.stringify(list.slice(-50)));
  } catch {}
  try {
    fetch("/api/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // Paso inicial (soporta 1: DNI, 2: Selfie, 3: Foto DNI, 4: Validación)
  const initialStepParam = Number(searchParams.get("step"));
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(() => {
    if (initialStepParam === 4 || (initialStepParam === 3 && searchParams.get("email"))) {
      return 4;
    }
    if (initialStepParam === 2 || initialStepParam === 3) {
      return initialStepParam as 2 | 3;
    }
    return 1;
  });

  // Datos Paso 1: DNI y Estados RENIEC
  const [dni, setDni] = useState("");
  const [isConsultingDni, setIsConsultingDni] = useState(false);
  const [reniecConsulted, setReniecConsulted] = useState(false);
  const [reniecError, setReniecError] = useState<string | null>(null);
  const [reniecData, setReniecData] = useState<{
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto: string;
    primerNombre: string;
    segundoNombre: string;
  } | null>(null);

  // Campos manuales VACÍOS (no se autocompletan)
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");

  // Nombre de usuario (ej. josev5050)
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"disponible" | "en_uso" | "invalido" | null>(null);

  // Credenciales y formulario
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  // Datos Paso 2 y 3: Selfie y Foto DNI (base64 en memoria local)
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [dniPhoto, setDniPhoto] = useState<string | null>(null);

  // Estados de carga y error general
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessComplete, setIsSuccessComplete] = useState(false);

  // Estado del código OTP en memoria vía EmailJS (Paso 4)
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [codeCreatedAt, setCodeCreatedAt] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const hasSentInitialOtpRef = useRef<boolean>(false);

  // Heartbeat y monitoreo de diagnóstico
  useEffect(() => {
    sendBreadcrumb("PAGE_MOUNTED", { step: currentStep });
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      sendBreadcrumb("FOCUS_IN", { tag: el?.tagName, id: el?.id, name: (el as any)?.name });
    };
    const onError = (e: ErrorEvent) => {
      sendBreadcrumb("WINDOW_ERROR", { message: e.message, filename: e.filename, lineno: e.lineno });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      sendBreadcrumb("PROMISE_REJECTION", { reason: String(e.reason) });
    };
    window.addEventListener("focusin", onFocus);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("focusin", onFocus);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [currentStep, dni, reniecConsulted, reniecData]);

  // Nombre completo calculado
  const nombreCompleto = [primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");

  // Validación de nombres en formulario (editables, obligatorios salvo segundo nombre)
  const primerNombreError =
    reniecConsulted && !primerNombre.trim() ? "Ingresa tu primer nombre" : null;
  const segundoNombreError = null;
  const apellidoPaternoError =
    reniecConsulted && !apellidoPaterno.trim() ? "Ingresa tu apellido paterno" : null;
  const apellidoMaternoError =
    reniecConsulted && !apellidoMaterno.trim() ? "Ingresa tu apellido materno" : null;

  const hasAllRequiredNames = Boolean(
    reniecConsulted &&
    primerNombre.trim() &&
    apellidoPaterno.trim() &&
    apellidoMaterno.trim()
  );

  const passwordConfirmError =
    confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden" : null;

  const isPaso1Valid = Boolean(
    reniecConsulted &&
    hasAllRequiredNames &&
    usernameStatus === "disponible" &&
    email.trim() &&
    email.includes("@") &&
    password.length >= 8 &&
    password === confirmPassword &&
    terminosAceptados &&
    !isLoading
  );

  // Verificación en vivo de disponibilidad de nombre de usuario (debounce 400ms)
  useEffect(() => {
    const clean = nombreUsuario.trim().toLowerCase();
    if (!clean) {
      const t = setTimeout(() => setUsernameStatus(null), 0);
      return () => clearTimeout(t);
    }

    if (!/^[a-z0-9_]{4,20}$/.test(clean)) {
      const t = setTimeout(() => setUsernameStatus("invalido"), 0);
      return () => clearTimeout(t);
    }

    const tLoading = setTimeout(() => setIsCheckingUsername(true), 0);
    const timer = setTimeout(async () => {
      try {
        const disponible = await checkUsernameDisponible(clean);
        setUsernameStatus(disponible ? "disponible" : "en_uso");
      } catch {
        setUsernameStatus("disponible");
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => {
      clearTimeout(tLoading);
      clearTimeout(timer);
    };
  }, [nombreUsuario]);

  // Manejo de cambio en DNI
  const handleDniChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 8);
    sendBreadcrumb("DNI_CHANGE", { length: clean.length, val: clean });
    setDni(clean);
    setReniecError(null);
    setReniecConsulted(false);
    setReniecData(null);
    setPrimerNombre("");
    setSegundoNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");
  };

  const ejecutarConsultaDni = async () => {
    sendBreadcrumb("RENIEC_CLICK", { dni });
    if (dni.length !== 8) {
      setReniecError("El DNI debe tener 8 dígitos numéricos.");
      return;
    }
    setIsConsultingDni(true);
    setReniecError(null);
    setReniecConsulted(false);
    setReniecData(null);
    // Limpiar campos antes de consultar
    setPrimerNombre("");
    setSegundoNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");

    try {
      sendBreadcrumb("CHECK_DNI_START", { dni });
      // 1. Validar si el DNI ya está registrado en Truekly
      const yaRegistrado = await checkDniRegistrado(dni);
      sendBreadcrumb("CHECK_DNI_RESULT", { yaRegistrado });
      if (yaRegistrado) {
        setReniecError("Este DNI ya tiene una cuenta.");
        setIsConsultingDni(false);
        return;
      }

      sendBreadcrumb("CONSULTAR_DNI_API_START", { dni });
      // 2. Consultar servicio RENIEC
      const res = await consultarDni({ dni });
      sendBreadcrumb("CONSULTAR_DNI_API_RESULT", { success: res.success, code: res.code });
      if (res.success && res.data) {
        // Parsear nombres considerando campos separados o completos con partículas
        const parsed = parseReniecNombres(res.data);
        const full =
          [parsed.primerNombre, parsed.segundoNombre, parsed.apellidoPaterno, parsed.apellidoMaterno]
            .filter(Boolean)
            .join(" ") || res.data.nombreCompleto;

        sendBreadcrumb("SETTING_RENIEC_DATA", { full });
        setReniecData({
          nombres: res.data.nombres || "",
          apellidoPaterno: res.data.apellidoPaterno || parsed.apellidoPaterno,
          apellidoMaterno: res.data.apellidoMaterno || parsed.apellidoMaterno,
          nombreCompleto: res.data.nombreCompleto || full,
          primerNombre: parsed.primerNombre,
          segundoNombre: parsed.segundoNombre,
        });

        // Autocompletar automáticamente los campos en formato Capitalizado
        setPrimerNombre(parsed.primerNombre);
        setSegundoNombre(parsed.segundoNombre);
        setApellidoPaterno(parsed.apellidoPaterno);
        setApellidoMaterno(parsed.apellidoMaterno);

        sendBreadcrumb("SETTING_RENIEC_CONSULTED_TRUE");
        setReniecConsulted(true);
      } else {
        setPrimerNombre("");
        setSegundoNombre("");
        setApellidoPaterno("");
        setApellidoMaterno("");

        let userMsg = res.message || "No se pudo obtener información del DNI.";
        if (res.code === "sin_token") {
          userMsg = "No se encontró el token de Decolecta. Revisa tu archivo .env y reinicia el servidor.";
        } else if (res.code === "no_autorizado") {
          userMsg = "Token de Decolecta no autorizado (401/403). Verifica tu token.";
        } else if (res.code === "limite_excedido") {
          userMsg = "Límite del plan de Decolecta excedido (100 consultas/mes).";
        } else if (res.code === "no_encontrado") {
          userMsg = "DNI no encontrado en el padrón de RENIEC.";
        } else if (res.code === "red") {
          userMsg = "Error de red al conectar con el servicio RENIEC.";
        }
        setReniecError(userMsg);
      }
    } catch {
      setPrimerNombre("");
      setSegundoNombre("");
      setApellidoPaterno("");
      setApellidoMaterno("");
      setReniecError("Error de conexión al consultar RENIEC. Inténtalo nuevamente.");
    } finally {
      setIsConsultingDni(false);
    }
  };

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "Vacía", color: "bg-line" };
    if (password.length < 8) return { score: 1, label: "Débil (mín. 8 caracteres)", color: "bg-red-500" };
    const hasNum = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (hasNum && hasUpper) return { score: 3, label: "Fuerte", color: "bg-jade-500" };
    return { score: 2, label: "Media (agrega mayúsculas y números)", color: "bg-amber-500" };
  };

  // Pase a Paso 2 (Selfie)
  const handlePaso1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPaso1Valid) {
      if (!hasAllRequiredNames) {
        setError("Completa tus nombres y apellidos.");
      } else if (usernameStatus !== "disponible") {
        setError("Elige un nombre de usuario válido y disponible.");
      } else if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
      } else {
        setError("Completa todos los campos obligatorios para continuar.");
      }
      return;
    }

    setIsLoading(true);
    try {
      const yaRegistrado = await checkDniRegistrado(dni);
      if (yaRegistrado) {
        setError("Este DNI ya tiene una cuenta.");
        setIsLoading(false);
        return;
      }

      const disponible = await checkUsernameDisponible(nombreUsuario);
      if (!disponible) {
        setError("Ese nombre de usuario no está disponible.");
        setIsLoading(false);
        return;
      }
    } catch {
      // Continuar si falla la verificación de red previa
    } finally {
      setIsLoading(false);
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Confirmación Paso 2: Pase a Paso 3 (Foto DNI)
  const handlePaso2Continuar = () => {
    if (!selfiePhoto) {
      setError("Toma una selfie para validar tu identidad.");
      return;
    }

    setError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Confirmación Paso 3: Pase a Paso 4 (Validación por correo)
  const handlePaso3Continuar = () => {
    if (!dniPhoto) {
      setError("Captura la foto de tu DNI físico para continuar.");
      return;
    }

    setError(null);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para generar y enviar un código nuevo vía EmailJS
  const dispararEnvioCodigo = useCallback(async () => {
    setError(null);
    setIsSendingEmail(true);
    const nuevoCodigo = generarCodigo6Digitos();
    const now = Date.now();
    setVerificationCode(nuevoCodigo);
    setCodeCreatedAt(now);
    setFailedAttempts(0);

    sendBreadcrumb("EMAILJS_SEND_START", { email });

    try {
      const res = await enviarCodigoVerificacion(
        email,
        primerNombre.trim() || "Usuario",
        nuevoCodigo
      );

      if (!res.success) {
        setError(res.error || "No se pudo enviar el correo de verificación. Puedes reintentar.");
        sendBreadcrumb("EMAILJS_SEND_ERROR", { error: res.error });
      } else {
        sendBreadcrumb("EMAILJS_SEND_SUCCESS");
      }
    } catch (err: any) {
      setError(err?.message || "Error al conectar con el servicio de correo.");
    } finally {
      setIsSendingEmail(false);
    }
  }, [email, primerNombre]);

  // Envío automático al entrar al paso 4 (con guardia contra doble ejecución por StrictMode)
  useEffect(() => {
    if (currentStep === 4 && !hasSentInitialOtpRef.current && email) {
      hasSentInitialOtpRef.current = true;
      dispararEnvioCodigo();
    }
  }, [currentStep, email, dispararEnvioCodigo]);

  // Verificación del código en Paso 4
  const handleVerifyOtp = async (inputCode: string) => {
    setError(null);

    // 1. Validar límite de 5 intentos fallidos
    if (failedAttempts >= 5) {
      setError("Has alcanzado el límite de 5 intentos fallidos. Debes solicitar un nuevo código.");
      return;
    }

    // 2. Validar expiración (10 minutos = 600,000 ms)
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const isExpired = !codeCreatedAt || Date.now() - codeCreatedAt > TEN_MINUTES_MS;
    if (isExpired) {
      setError("El código ha expirado (validez de 10 minutos). Solicita uno nuevo con el botón Reenviar.");
      return;
    }

    setIsLoading(true);

    // 3. Comparar código ingresado con el generado en memoria
    if (inputCode.trim() !== verificationCode) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      setIsLoading(false);

      if (nextAttempts >= 5) {
        setError("Código incorrecto. Has alcanzado el límite de 5 intentos. Debes solicitar un nuevo código.");
      } else {
        setError(`Código incorrecto. Te quedan ${5 - nextAttempts} intento(s).`);
      }
      return;
    }

    // 4. Código correcto y no expirado: Registrar cuenta en Supabase Auth
    sendBreadcrumb("REGISTER_VERIFIED_SUCCESS", { email, nombre: nombreCompleto });

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            dni: dni.trim(),
            primer_nombre: primerNombre.trim(),
            segundo_nombre: segundoNombre?.trim() || "",
            apellido_paterno: apellidoPaterno.trim(),
            apellido_materno: apellidoMaterno?.trim() || "",
            nombre_reniec: nombreCompleto || `${primerNombre} ${apellidoPaterno}`.trim(),
            username: nombreUsuario.trim().toLowerCase(),
            identidad_verificada: true,
          },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.message.toLowerCase().includes("user already exists")
        ) {
          throw new Error("Este correo ya está registrado. Inicia sesión con tus credenciales.");
        }
        throw signUpError;
      }

      const authUser = signUpData.user;
      if (!authUser) {
        throw new Error("No se pudo inicializar la cuenta en el servidor.");
      }

      // 5. Subir fotos de validación a buckets privados (carpeta {user_id}/*)
      const selfieStoragePath = `selfies/${authUser.id}/selfie.jpg`;
      const dniStoragePath = `dni-fotos/${authUser.id}/dni_front.jpg`;

      if (selfiePhoto) {
        const selfieBlob = base64ToBlob(selfiePhoto);
        const { error: selfieUploadError } = await supabase.storage
          .from("selfies")
          .upload(`${authUser.id}/selfie.jpg`, selfieBlob, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (selfieUploadError) {
          throw new Error(`Error al subir selfie de verificación: ${selfieUploadError.message}`);
        }
      }

      if (dniPhoto) {
        const dniBlob = base64ToBlob(dniPhoto);
        const { error: dniUploadError } = await supabase.storage
          .from("dni-fotos")
          .upload(`${authUser.id}/dni_front.jpg`, dniBlob, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (dniUploadError) {
          throw new Error(`Error al subir fotografía del DNI: ${dniUploadError.message}`);
        }
      }

      // 6. Guardar / actualizar perfil en la tabla profiles
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authUser.id,
        dni: dni.trim(),
        primer_nombre: primerNombre.trim(),
        segundo_nombre: segundoNombre?.trim() || null,
        apellido_paterno: apellidoPaterno.trim(),
        apellido_materno: apellidoMaterno?.trim() || null,
        nombre_reniec: nombreCompleto || `${primerNombre} ${apellidoPaterno}`.trim(),
        username: nombreUsuario.trim().toLowerCase(),
        email: cleanEmail,
        avatar_url: null,
        selfie_path: selfieStoragePath,
        dni_foto_path: dniStoragePath,
        identidad_verificada: true,
      });

      if (profileError) {
        throw new Error(`Error al registrar perfil: ${profileError.message}`);
      }

      // 7. Sincronizar contexto y redirigir al feed
      const registeredUser = {
        id: authUser.id,
        nombre: nombreCompleto || `${primerNombre} ${apellidoPaterno}`.trim(),
        primerNombre: primerNombre || undefined,
        segundoNombre: segundoNombre || undefined,
        apellidoPaterno: apellidoPaterno || undefined,
        apellidoMaterno: apellidoMaterno || undefined,
        username: nombreUsuario.trim().toLowerCase(),
        email: cleanEmail,
        fotoPerfil: selfiePhoto || null,
        verificado: true,
      };
      login(registeredUser);

      setIsLoading(false);
      setIsSuccessComplete(true);

      setTimeout(() => {
        window.location.hash = "#feed";
        navigate("/#feed");
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Ocurrió un error al completar el registro.");
    }
  };

  // Reenviar código (invalida el anterior y reinicia intentos)
  const handleResendOtp = async () => {
    await dispararEnvioCodigo();
  };

  const passwordStrength = getPasswordStrength();

  return (
    <AuthLayout
      title={
        currentStep === 1
          ? "Crea tu cuenta en Truekly"
          : currentStep === 2
          ? "Validación de identidad"
          : currentStep === 3
          ? "Foto de tu DNI físico"
          : "Verifica tu correo"
      }
      subtitle={
        currentStep === 1
          ? "Ingresa tus datos oficiales para unirte a la red de trueque."
          : currentStep === 2
          ? "Toma una foto rápida para asegurar la confianza de la comunidad."
          : currentStep === 3
          ? "Captura la parte frontal de tu documento de identidad."
          : "Confirma tu cuenta con el código de seguridad que enviamos."
      }
    >
      <StepProgress currentStep={currentStep} />

      {/* Error general con accesibilidad */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span className="flex-1 leading-relaxed">{error}</span>
        </div>
      )}

      {/* Pantalla final de éxito */}
      {isSuccessComplete ? (
        <div className="py-8 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-jade-100 text-jade-600 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-jade-600" />
          </div>
          <h2 className="text-xl font-bold text-ink font-display">¡Cuenta verificada con éxito!</h2>
          <p className="text-xs text-ink-soft max-w-xs mx-auto">
            Bienvenido a Truekly Chimbote. Redirigiéndote a las publicaciones activas...
          </p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-jade-500" />
        </div>
      ) : (
        <>
          {/* PASO 1: Formulario de DNI y Credenciales */}
          {currentStep === 1 && (
            <form onSubmit={handlePaso1Submit} className="space-y-2" noValidate autoComplete="off">
              {/* 1. DNI con botón de consulta RENIEC */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="tk-dni" className="block text-[11px] font-medium text-ink">
                    Número de DNI (8 dígitos)
                  </label>
                  {reniecConsulted && (
                    <button
                      type="button"
                      onClick={() => {
                        setReniecConsulted(false);
                        setReniecData(null);
                        setPrimerNombre("");
                        setSegundoNombre("");
                        setApellidoPaterno("");
                        setApellidoMaterno("");
                      }}
                      className="text-[10px] font-medium text-jade-600 hover:text-jade-700 underline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 rounded"
                    >
                      Editar DNI
                    </button>
                  )}
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
                    <input
                      id="tk-dni"
                      name="tk_dni"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      autoComplete="one-time-code"
                      autoCorrect="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      value={dni}
                      readOnly={reniecConsulted}
                      onChange={(e) => handleDniChange(e.target.value)}
                      placeholder="Ingrese su DNI"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl border border-line text-sm text-ink outline-none transition-all duration-200 ${
                        reniecConsulted
                          ? "bg-paper text-ink cursor-default font-medium border-jade-200"
                          : "bg-white placeholder:text-sage-400 focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                      }`}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={ejecutarConsultaDni}
                    disabled={dni.length !== 8 || isConsultingDni || reniecConsulted}
                    className="h-10 px-3.5 rounded-xl border border-jade-600 bg-jade-50 text-xs font-semibold text-jade-700 hover:bg-jade-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500"
                  >
                    {isConsultingDni ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-jade-700" />
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5" />
                        <span>RENIEC</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Rectángulo SIN bordes tras consulta RENIEC (o estados cargando / error con Reintentar) */}
              {isConsultingDni && (
                <div className="rounded-xl bg-jade-50/70 p-2.5 flex items-center gap-2 text-xs text-jade-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-jade-600 shrink-0" />
                  <span>Consultando padrón de RENIEC...</span>
                </div>
              )}

              {reniecError && (
                <div className="rounded-xl bg-red-50/80 p-2.5 flex items-start justify-between gap-2 text-xs text-red-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span className="leading-snug">{reniecError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={ejecutarConsultaDni}
                    className="font-semibold text-red-800 hover:underline shrink-0 text-[11px] ml-1"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {reniecConsulted && reniecData && (
                <div className="rounded-xl bg-jade-50/70 p-2.5 flex items-start gap-2.5 select-none transition-all duration-200">
                  <CheckCircle2 className="h-4 w-4 text-jade-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-jade-700 uppercase tracking-wider">
                      Nombre según RENIEC
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-ink truncate mt-0.5">
                      {reniecData.nombreCompleto}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Fila 1: Primer nombre y Segundo nombre (opcional) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="tk-pn" className="block text-[11px] font-medium text-ink mb-0.5 truncate">
                    Primer nombre
                  </label>
                  <input
                    id="tk-pn"
                    name="tk_pn"
                    type="text"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    disabled={!reniecConsulted}
                    value={primerNombre}
                    onChange={(e) => setPrimerNombre(e.target.value)}
                    placeholder="Ingrese primer nombre"
                    className={`w-full h-10 px-3 rounded-xl border text-sm text-ink outline-none transition-all duration-200 ${
                      primerNombreError
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                        : "border-line bg-white focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                    } disabled:bg-paper disabled:text-sage-400 disabled:cursor-not-allowed`}
                    required
                  />
                  {primerNombreError && (
                    <p className="mt-0.5 text-[10px] text-red-600 font-medium">{primerNombreError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tk-sn" className="block text-[11px] font-medium text-ink mb-0.5 truncate">
                    Segundo nombre <span className="text-sage-400 font-normal">(opc.)</span>
                  </label>
                  <input
                    id="tk-sn"
                    name="tk_sn"
                    type="text"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    disabled={!reniecConsulted}
                    value={segundoNombre}
                    onChange={(e) => setSegundoNombre(e.target.value)}
                    placeholder="Ingrese segundo nombre"
                    className={`w-full h-10 px-3 rounded-xl border text-sm text-ink outline-none transition-all duration-200 ${
                      segundoNombreError
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                        : "border-line bg-white focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                    } disabled:bg-paper disabled:text-sage-400 disabled:cursor-not-allowed`}
                  />
                  {segundoNombreError && (
                    <p className="mt-0.5 text-[10px] text-red-600 font-medium">{segundoNombreError}</p>
                  )}
                </div>
              </div>

              {/* 4. Fila 2: Apellido paterno y Apellido materno */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="tk-ap" className="block text-[11px] font-medium text-ink mb-0.5 truncate">
                    Apellido paterno
                  </label>
                  <input
                    id="tk-ap"
                    name="tk_ap"
                    type="text"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    disabled={!reniecConsulted}
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    placeholder="Ingrese apellido paterno"
                    className={`w-full h-10 px-3 rounded-xl border text-sm text-ink outline-none transition-all duration-200 ${
                      apellidoPaternoError
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                        : "border-line bg-white focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                    } disabled:bg-paper disabled:text-sage-400 disabled:cursor-not-allowed`}
                    required
                  />
                  {apellidoPaternoError && (
                    <p className="mt-0.5 text-[10px] text-red-600 font-medium">{apellidoPaternoError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tk-am" className="block text-[11px] font-medium text-ink mb-0.5 truncate">
                    Apellido materno
                  </label>
                  <input
                    id="tk-am"
                    name="tk_am"
                    type="text"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    disabled={!reniecConsulted}
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    placeholder="Ingrese apellido materno"
                    className={`w-full h-10 px-3 rounded-xl border text-sm text-ink outline-none transition-all duration-200 ${
                      apellidoMaternoError
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                        : "border-line bg-white focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                    } disabled:bg-paper disabled:text-sage-400 disabled:cursor-not-allowed`}
                    required
                  />
                  {apellidoMaternoError && (
                    <p className="mt-0.5 text-[10px] text-red-600 font-medium">{apellidoMaternoError}</p>
                  )}
                </div>
              </div>

              {/* 5. Nombre de usuario (ej. josev5050) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="tk-usr" className="block text-[11px] font-medium text-ink">
                    Nombre de usuario
                  </label>
                  <div className="text-[10px]">
                    {isCheckingUsername ? (
                      <span className="text-sage-500 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Comprobando...
                      </span>
                    ) : usernameStatus === "disponible" ? (
                      <span className="text-jade-600 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Disponible
                      </span>
                    ) : usernameStatus === "en_uso" ? (
                      <span className="text-red-600 font-semibold">Ese nombre de usuario no está disponible</span>
                    ) : usernameStatus === "invalido" ? (
                      <span className="text-amber-600">4-20 car. (a-z, 0-9, _)</span>
                    ) : null}
                  </div>
                </div>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
                  <input
                    id="tk-usr"
                    name="tk_usr"
                    type="text"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    autoCapitalize="none"
                    value={nombreUsuario}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
                      setNombreUsuario(clean);
                    }}
                    placeholder="Ingrese su nombre de usuario"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-sage-400 outline-none transition-all duration-200 focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* 6. Correo Electrónico */}
              <div>
                <label htmlFor="tk-email" className="block text-[11px] font-medium text-ink mb-0.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
                  <input
                    id="tk-email"
                    name="tk_email"
                    type="email"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingrese su correo electrónico"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-sage-400 outline-none transition-all duration-200 focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                    required
                  />
                </div>
              </div>

              {/* 7. Contraseña y Confirmar Contraseña (2 columnas) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="tk-pwd" className="block text-[11px] font-medium text-ink mb-0.5 truncate">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
                    <input
                      id="tk-pwd"
                      name="tk_pwd"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingrese su contraseña"
                      className="w-full h-10 pl-8 pr-7 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-sage-400 outline-none transition-all duration-200 focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sage-400 hover:text-ink transition-colors rounded"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="tk-cpwd" className="block text-[11px] font-medium text-ink mb-0.5 truncate">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
                    <input
                      id="tk-cpwd"
                      name="tk_cpwd"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme su contraseña"
                      className={`w-full h-10 pl-8 pr-7 rounded-xl border text-sm text-ink placeholder:text-sage-400 outline-none transition-all duration-200 ${
                        passwordConfirmError
                          ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                          : "border-line bg-white focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20"
                      } text-xs`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sage-400 hover:text-ink transition-colors rounded"
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error de confirmación o medidor de fortaleza */}
              {passwordConfirmError ? (
                <p className="text-[10px] text-red-600 font-medium -mt-1">{passwordConfirmError}</p>
              ) : password ? (
                <div className="flex items-center gap-2 -mt-1">
                  <div className="h-1 flex-1 bg-line rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-sage-500 font-medium shrink-0">
                    {passwordStrength.label}
                  </span>
                </div>
              ) : null}

              {/* 8. Checkbox de Términos */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={terminosAceptados}
                    onChange={(e) => setTerminosAceptados(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-line text-jade-600 focus:ring-jade-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-ink-soft leading-snug">
                    Acepto los Términos de Servicio y la Política de Privacidad bajo la{" "}
                    <span className="font-semibold text-ink">Ley N° 29733</span>.
                  </span>
                </label>
              </div>

              {/* 9. Botón Siguiente (Deshabilitado hasta que todo coincida y sea válido) */}
              <button
                type="submit"
                disabled={!isPaso1Valid}
                className="w-full h-10 mt-1.5 rounded-xl bg-gradient-to-r from-jade-600 to-jade-500 text-sm font-medium text-white shadow-xs hover:from-jade-700 hover:to-jade-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-2"
              >
                <span>Siguiente: Tomar Selfie</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* 10. Separador "o" y enlace a Login */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 font-mono text-[10px] uppercase tracking-wider text-sage-500">
                    o
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-ink/[0.06] bg-paper/60 py-2 px-3 text-center text-xs text-ink/70">
                ¿Ya tienes una cuenta registrada?{" "}
                <Link
                  to="/ingresar"
                  className="font-semibold text-jade-600 hover:text-jade-700 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 rounded-xs"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          )}

          {/* PASO 2: Selfie con cámara y guía visual */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <SelfieStep
                onCapture={(b64) => setSelfiePhoto(b64)}
                savedPhoto={selfiePhoto}
                onClear={() => setSelfiePhoto(null)}
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="h-11 px-4 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:bg-paper transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={handlePaso2Continuar}
                  disabled={!selfiePhoto}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-jade-600 to-jade-500 text-sm font-medium text-white shadow-xs hover:from-jade-700 hover:to-jade-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-2"
                >
                  <span>Continuar a Foto DNI</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Captura de Foto del DNI físico (nuevo) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <DniPhotoStep
                onCapture={(b64) => setDniPhoto(b64)}
                savedPhoto={dniPhoto}
                onClear={() => setDniPhoto(null)}
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="h-11 px-4 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:bg-paper transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={handlePaso3Continuar}
                  disabled={!dniPhoto || isLoading || isSendingEmail}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-jade-600 to-jade-500 text-sm font-medium text-white shadow-xs hover:from-jade-700 hover:to-jade-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-2"
                >
                  <span>Continuar a Validación</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: Validación con código OTP */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <OtpStep
                email={email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onRetrySend={dispararEnvioCodigo}
                isLoading={isLoading}
                isSendingEmail={isSendingEmail}
                error={error}
                canVerify={failedAttempts < 5}
              />

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-500 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-jade-500 rounded p-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Volver al paso de captura de DNI</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
}
