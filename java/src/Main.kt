import java.awt.image.BufferedImage
import java.io.File
import java.io.IOException
import java.util.*
import javax.imageio.ImageIO
import kotlin.collections.ArrayList
import kotlin.math.abs

object Main {
    const val WIDTH = 1240
    const val HEIGHT = 1748
    const val MAIN_PATH = "../../SHIBAWARS/IMAGE_BASES/"

    @JvmStatic
    fun main(args: Array<String>) {
        processShiba("shiba-warrior", 108)
    }

    @Throws(IOException::class)
    fun processShiba(shibaName: String, shibaId: Int) {
        val path = MAIN_PATH + shibaName + "/"

        val backgrounds = path + "background"
        val eyes = path + "eye"
        val heads = path + "head"
        val chains = path + "chain"
        val miscs = path + "misc"
        val weapons = path + "weapon"
        val output = MAIN_PATH + "../shibas"

        val bgLength = File(backgrounds).list()!!.size
        val eyeLength = File(eyes).list()!!.size
        val headLength = File(heads).list()!!.size
        val chainsLength = File(chains).list()!!.size
        val miscLength = File(miscs).list()!!.size
        val wpLength = File(weapons).list()!!.size

        val shiba = ImageIO.read(File(path + "shiba/0.png"))
        val combinations = bgLength * (if (eyeLength > 0) eyeLength else 1) * (if (headLength > 0) headLength else 1) *
                (if (chainsLength > 0) chainsLength else 1) * (if (miscLength > 0) miscLength else 1) * (if (wpLength > 0) wpLength else 1)

        val list = ArrayList<Int>(combinations)
        for (i in 0 until combinations)
            list.add(i)
        val r = Random()

        for (bgI in 0 until bgLength) {
            val background = ImageIO.read(File("$backgrounds/$bgI.png"))
            var eyeI = 0
            while (eyeI < eyeLength || eyeI < 1) {
                val eye = if (eyeLength > 0) ImageIO.read(File("$eyes/$eyeI.png")) else null
                var headI = 0
                while (headI < headLength || headI < 1) {
                    val head = if (headLength > 0) ImageIO.read(File("$heads/$headI.png")) else null
                    var chainI = 0
                    while (chainI < chainsLength || chainI < 1) {
                        val chain = if (chainsLength > 0) ImageIO.read(File("$chains/$chainI.png")) else null
                        var weaponI = 0
                        while (weaponI < wpLength || weaponI < 1) {
                            val weapon = if (wpLength > 0) ImageIO.read(File("$weapons/$weaponI.png")) else null
                            var miscI = 0
                            while (miscI < miscLength || miscI < 1) {
                                val misc = if (miscLength > 0) ImageIO.read(File("$miscs/$miscI.png")) else null

                                val combined = BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_ARGB)

                                // paint both images, preserving the alpha channels
                                val g = combined.graphics
                                g.drawImage(background, 0, 0, null)
                                g.drawImage(shiba, 0, 0, null)
                                eye?.let { g.drawImage(it, 0, 0, null) }
                                head?.let { g.drawImage(it, 0, 0, null) }
                                chain?.let { g.drawImage(it, 0, 0, null) }
                                misc?.let { g.drawImage(it, 0, 0, null) }
                                weapon?.let { g.drawImage(it, 0, 0, null) }
                                g.dispose()

                                val index = abs(r.nextInt()) % list.size
                                val id = (shibaId * 1000000) + list[index]
                                ImageIO.write(combined, "PNG", File(output, "$id.png"))
                                println("Shiba $id generated")
                                list.removeAt(index)
                                ++miscI
                            }
                            ++weaponI
                        }
                        ++chainI
                    }
                    ++headI
                }
                ++eyeI
            }
        }
    }


}