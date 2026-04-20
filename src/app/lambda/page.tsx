import ActivationsClient from "../activations-client";
import { semianalysisLambdaConfig } from "@/config/semianalysis-lambda";

export default function LambdaPage() {
  return <ActivationsClient config={semianalysisLambdaConfig} />;
}
