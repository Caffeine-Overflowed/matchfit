import { type FC, Suspense } from "react";
import {GoogleAuthContainer} from "@/features/auth/container/GoogleAuthContainer";

export const dynamic = "force-static";
export const revalidate = false;


const GoogleAuthPage: FC = () => {

  return (
    <Suspense fallback={null}>
      <GoogleAuthContainer />
    </Suspense>
  );
};

export default GoogleAuthPage;
