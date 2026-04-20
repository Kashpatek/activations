import ActivationsClient from "./activations-client";
import { semianalysisGenericConfig } from "@/config/semianalysis-generic";

export default function Home() {
  return <ActivationsClient config={semianalysisGenericConfig} />;
}
