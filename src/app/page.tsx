import ActivationsClient from "./activations-client";
import { semianalysisAwsConfig } from "@/config/semianalysis-aws";

export default function Home() {
  return <ActivationsClient config={semianalysisAwsConfig} />;
}
