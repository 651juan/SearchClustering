import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by juan on 20/04/2016.
 */
public class Csvmkr {
    public void stuff() {
        try {
            Reader in = new FileReader("C:\\Users\\juan\\Documents\\MATLAB\\100\\100searches.csv");
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.parse(in);
            int count = 0;
            int filecounter = 1;
            CSVFormat format = CSVFormat.DEFAULT;
            BufferedWriter writer = new BufferedWriter(new FileWriter(String.valueOf(filecounter + ".csv")));
            CSVPrinter printer = new CSVPrinter(writer, format);
            for (CSVRecord element : records) {
                if (count == 64) {
                    // save file
                    printer.flush();
                    filecounter++;
                    writer = new BufferedWriter(new FileWriter(String.valueOf(filecounter + ".csv")));
                    printer = new CSVPrinter(writer, format);
                    count = 0;
//                } else if (count == 62) {
//                    format = CSVFormat.DEFAULT.withRecordSeparator(null);
//                    writer = new BufferedWriter(new FileWriter(String.valueOf(filecounter + ".csv")));
//                    printer = new CSVPrinter(writer, format);
//                    printer.printRecord(element);
//                    count++;
                } else {
                    printer.printRecord(element);
                    count++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
