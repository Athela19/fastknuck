import Sidekiri from "@/component/subComponent/Dashboard/sidebarKiri";
import Sidekanan from "@/component/subComponent/Dashboard/sidebarKanan";
import Postcard from "@/component/subComponent/Dashboard/postcard/index";

export default function Home() {
  return (
    <div>
      <Sidekiri />
      <Postcard />
      <Sidekanan />
    </div>
  );
}