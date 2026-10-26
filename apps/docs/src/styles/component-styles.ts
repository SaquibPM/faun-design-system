// Component styles straight from package sources, so docs always reflect the code being edited.
// Order: shared helpers first, then every component stylesheet, wrapped in Faun's cascade layers by the browser via @layer in each import.
import "../../../../packages/react/src/utils/shared.css";
import.meta.glob(["../../../../packages/*/src/components/*/*.css", "../../../../packages/*/src/utils/*.css"], { eager: true });
