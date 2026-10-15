import { Banner } from "@/components/site/banner";
import { Benefits } from "@/components/site/benefits";
import { CategoryTiles } from "@/components/site/category-tiles";
import { EditorialBand } from "@/components/site/editorial-band";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { LooksSticky } from "@/components/site/looks-sticky";
import { NewIn } from "@/components/site/new-in";
import { RangeRail } from "@/components/site/range-rail";
import { ShopAndOnline } from "@/components/site/shop-and-online";
import { SizingAndFit } from "@/components/site/sizing-and-fit";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Banner />
        <CategoryTiles />
        <RangeRail />
        <NewIn />
        <EditorialBand />
        <LooksSticky />
        <Benefits />
        <ShopAndOnline />
        <SizingAndFit />
      </main>
      <Footer />
    </>
  );
}
