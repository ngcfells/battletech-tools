import React, { type JSX } from 'react';
import type { BattleMech } from '../../../classes/battlemech';
import { bubblePositions, type IArmorBubbleLocation } from './armor-bubble-layouts';
import DamageCircleSVG from './damage-circle-svg';

interface IArmorBubblesOptions {
    mechData: BattleMech;
    inPlay?: boolean;
    armorBoxTop: number;
    armorBoxLeft: number;
    armorBoxWidth: number;
    onClick( loc: string, index: number ): void;
}

/** One DamageCircleSVG per point of armor, up to what the rules allow the location, filled from its center outward. */
export const renderArmorBubbles = ( layout: IArmorBubbleLocation[], options: IArmorBubblesOptions ): JSX.Element[] => {
    const allocation = options.mechData.getArmorAllocation();
    const centerX = options.armorBoxLeft + options.armorBoxWidth / 2;
    return layout.flatMap( (location) => {
        const count = Math.min( allocation[location.field] ?? 0, options.mechData.getMaxLocationArmor( location.field ) );
        const { points, radius } = bubblePositions( location.points, location.radius, count );
        return points.map( ([x, y], index) => (
            <DamageCircleSVG
                key={location.loc + index}
                isFilled={options.mechData.armorDamaged( location.loc, index )}
                xLoc={centerX + x}
                yLoc={options.armorBoxTop + y}
                radius={radius}
                inPlay={options.inPlay}
                clickLocation={location.loc}
                clickIndex={index}
                clickFunction={options.onClick}
            />
        ));
    });
};
