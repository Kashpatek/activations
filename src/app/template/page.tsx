import ActivationsClient from "../activations-client";
import { templateConfig } from "@/config/template";

export default function TemplatePage() {
  return <ActivationsClient config={templateConfig} />;
}
