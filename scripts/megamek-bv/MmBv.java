import java.io.File;

import megamek.client.ui.clientGUI.calculationReport.TextCalculationReport;
import megamek.common.equipment.EquipmentType;
import megamek.common.loaders.MekFileParser;
import megamek.common.units.Entity;

// Prints MegaMek's BV (and, with MMREPORT set, its BV report) for each unit file given.
public class MmBv {
    public static void main(String[] args) throws Exception {
        EquipmentType.initializeTypes();
        boolean report = System.getenv("MMREPORT") != null;
        for (String path : args) {
            try {
                Entity entity = new MekFileParser(new File(path)).getEntity();
                TextCalculationReport text = new TextCalculationReport();
                System.out.println(path + "\t" + entity.calculateBattleValue(true, true, true, text));
                if (report) System.out.println(text);
            } catch (Exception e) {
                System.out.println(path + "\tERROR " + e);
            }
        }
    }
}
