import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Link } from "react-router";
import UpdateComponent from "./UpdateComponent";

const UpdatePage = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/settings">Configurações</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Atualizações</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <UpdateComponent />
    </div>
  );
};

export default UpdatePage; 