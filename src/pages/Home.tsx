import { Hero } from '../sections/Hero';
import { Manifesto } from '../sections/Manifesto';
import { WorkReel } from '../sections/WorkReel';
import { ProjectIndex } from '../sections/ProjectIndex';
import { Experience } from '../sections/Experience';
import { Achievements } from '../sections/Achievements';
import { Skills } from '../sections/Skills';
import { Contact } from '../sections/Contact';
import { FilterDefs } from '../components/Chrome';

export function Home() {
  return (
    <div className="page-home">
      <FilterDefs />
      <Hero />
      <Manifesto />
      <WorkReel />
      <ProjectIndex />
      <Experience />
      <Achievements />
      <Skills />
      <Contact />
    </div>
  );
}
